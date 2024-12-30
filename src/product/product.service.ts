import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { generateSlug, paginating } from 'src/lib/utils/helper';
import { CreateProductDto, UpdateProductDto } from './dto/product.input';
import { PRODUCT_ORDER_BY } from './product.constant';
import { transformPayload } from './product.helper';
import { productMapper, ProductMapperPayload } from './product.mapper';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  private include: Prisma.ProductInclude = {
    brand: { where: { deletedAt: null } },
    category: true,
    variants: { where: { deletedAt: null } },
  };

  create(payload: CreateProductDto) {
    const slug = generateSlug(payload.name);
    return this.prisma.product.create({
      data: transformPayload(payload, slug),
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

    const items = await paginating(
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
    const data = await this.prisma.product.findUniqueOrThrow({
      where: { id },
      include: this.include,
    });
    return productMapper(data);
  }

  async findOneBySlug(slug: string) {
    const data = await this.prisma.product.findUniqueOrThrow({
      where: { slug },
      include: this.include,
    });

    return productMapper(data);
  }

  async update(id: number, payload: UpdateProductDto) {
    const [_, result] = await this.prisma.$transaction([
      this.prisma.variant.deleteMany({ where: { productId: id } }),
      this.prisma.product.update({
        where: { id },
        data: transformPayload(payload),
        select: { id: true },
      }),
    ]);
    return result;
  }

  async remove(id: number) {
    return this.prisma.product.delete({ where: { id }, select: { id: true } });
  }
}
