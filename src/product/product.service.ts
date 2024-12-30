import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { generateSlug, paginating } from 'src/lib/utils/helper';
import {
  CreateProductDto,
  CreateProductRatingDto,
  UpdateProductDto,
  UpdateProductRatingDto,
} from './dto/product.input';
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
      include: {
        ...this.include,
        ratings: { where: { deletedAt: null }, include: { user: true } },
      },
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

  async createRating(
    payload: CreateProductRatingDto,
    productId: number,
    userId: number,
  ) {
    const count = await this.prisma.rating.count({
      where: {
        productId,
        userId,
      },
    });
    if (count > 0) {
      throw new ConflictException();
    }
    return this.prisma.rating.create({
      data: {
        ...payload,
        userId,
        productId,
      },
    });
  }

  private async checkProductRating(
    id: number,
    productId: number,
    userId: number,
  ) {
    const rating = await this.prisma.rating.findUniqueOrThrow({
      where: { id },
    });
    if (productId !== rating.productId) {
      throw new NotFoundException();
    }
    if (rating.userId !== userId) {
      throw new ForbiddenException();
    }

    return rating;
  }

  async updateRating(
    id: number,
    payload: UpdateProductRatingDto,
    productId: number,
    userId: number,
  ) {
    await this.checkProductRating(id, productId, userId);

    return this.prisma.rating.update({
      where: { id },
      data: payload,
    });
  }

  async removeRating(id: number, productId: number, userId: number) {
    await this.checkProductRating(id, productId, userId);
    return this.prisma.rating.delete({ where: { id } });
  }
}
