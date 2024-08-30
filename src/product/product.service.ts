import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { generateSlug, paginator } from 'src/lib/utils/helper';
import { CreateProductDto, UpdateProductDto } from './dto/product.input';
import { productMapper, ProductMapperPayload } from './product.mapper';
import { PRODUCT_ORDER_BY } from './product.constant';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  private include: Prisma.ProductInclude = {
    brand: { where: { deletedAt: null } },
    category: true,
    variants: { where: { deletedAt: null } },
  };

  private calcPrice(price?: number, salePercent?: number) {
    return price ? price * (1 - (salePercent ?? 0) / 100) : undefined;
  }

  private transformPayload(
    data: CreateProductDto | UpdateProductDto,
    slug?: string,
  ): Prisma.ProductCreateInput | Prisma.ProductUpdateInput {
    if (
      isNaN(Number(data.price)) &&
      !(data.variantProps?.length && data.variants?.length)
    ) {
      throw new BadRequestException('Price or variants must be provided');
    }

    const transformedData:
      | Prisma.ProductCreateInput
      | Prisma.ProductUpdateInput = {
      ...data,
      extraOptions: data.extraOptions
        ? JSON.stringify(data.extraOptions)
        : undefined,
      variantProps: undefined,
      variants: undefined,
      slug,
      actualAvgPrice: this.calcPrice(data.price, data.salePercent),
    };

    if (data.variantProps?.length && data.variants?.length) {
      transformedData.variantProps = JSON.stringify(data.variantProps);
      transformedData.variants = {
        createMany: {
          data: data.variants,
        },
      };
      const avgPrice =
        data.variants.reduce((acc, crr) => acc + crr.price, 0) /
        data.variants.length;
      transformedData.actualAvgPrice = this.calcPrice(
        avgPrice,
        data.salePercent,
      );
    }

    return transformedData;
  }

  create(payload: CreateProductDto) {
    const slug = generateSlug(payload.name);
    return this.prisma.product.create({
      data: this.transformPayload(payload, slug) as Prisma.ProductCreateInput,
      select: { id: true },
    });
  }

  async findAll(query?: RequestQuery) {
    const priceQuery = query?.price?.split(',')?.map((i) => +i) ?? [];
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};

    switch (query?.sort) {
      case PRODUCT_ORDER_BY.PRICE_ASC:
        orderBy.actualAvgPrice = 'asc';
        break;
      case PRODUCT_ORDER_BY.PRICE_DESC:
        orderBy.actualAvgPrice = 'desc';
        break;
      case PRODUCT_ORDER_BY.POPULAR:
        orderBy.pin = 'desc';
        break;
      default:
        orderBy.updatedAt = 'desc';
        break;
    }

    const items = await paginator(
      this.prisma.product,
      {
        include: this.include,
        where: {
          name: query?.name || undefined,
          categoryId: query?.category
            ? {
                in: query.category.split(',').map((i) => +i),
              }
            : undefined,
          actualAvgPrice: {
            gte: priceQuery[0] || undefined,
            lte: priceQuery[1] || undefined,
          },
          pin: query?.pin === 'true' || undefined,
        },
        orderBy,
      },
      query,
    );
    return productMapper(items as ProductMapperPayload);
  }

  async findOne(id: number) {
    try {
      const data = await this.prisma.product.findUniqueOrThrow({
        where: { id },
        include: this.include,
      });
      return productMapper(data);
    } catch {
      throw new NotFoundException();
    }
  }

  async findOneBySlug(slug: string) {
    try {
      const data = await this.prisma.product.findUniqueOrThrow({
        where: { slug },
        include: this.include,
      });

      return productMapper(data);
    } catch {
      throw new NotFoundException();
    }
  }

  async update(id: number, payload: UpdateProductDto) {
    await this.findOne(id);
    await this.prisma.variant.deleteMany({ where: { productId: id } });
    return this.prisma.product.update({
      where: { id },
      data: this.transformPayload(payload) as Prisma.ProductUpdateInput,
      select: { id: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id }, select: { id: true } });
  }
}
