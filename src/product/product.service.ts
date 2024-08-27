import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto/product.input';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { generateSlug, paginator } from 'src/lib/utils/helper';
import { Prisma } from '@prisma/client';
import { productMapper, ProductMapperPayload } from './product.mapper';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  include: Prisma.ProductInclude = {
    brand: { where: { deletedAt: null } },
    category: true,
    variants: { where: { deletedAt: null } },
  };

  transformPayload(
    data: CreateProductDto | UpdateProductDto,
    slug?: string,
  ): Prisma.ProductCreateInput | Prisma.ProductUpdateInput {
    if (
      isNaN(Number(data.price)) &&
      !(data.variantProps?.length && data.variants?.length)
    ) {
      throw new BadRequestException('Price or variants must be provided');
    }
    return {
      ...data,
      slug,
      variants: data.variants
        ? {
            createMany: {
              data: data.variants,
            },
          }
        : undefined,
      variantProps: data.variantProps
        ? JSON.stringify(data.variantProps)
        : undefined,
      extraOptions: data.extraOptions
        ? JSON.stringify(data.extraOptions)
        : undefined,
    };
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
          price: {
            gte: priceQuery[0],
            lte: priceQuery[1],
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      },
      query,
    );
    return productMapper(items as ProductMapperPayload, query?.sort);
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
