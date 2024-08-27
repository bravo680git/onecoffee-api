import { Prisma } from '@prisma/client';

type ProductItemInput = Prisma.ProductGetPayload<{
  include: { brand: true; category: true; variants: true };
}>;

type ProductItemOutput = Omit<ProductItemInput, ''> & {
  minPrice: number;
  maxPrice: number;
};

export type ProductMapperPayload =
  | ProductItemInput
  | ProductItemInput[]
  | { data: ProductItemInput[] };

const ProductOrderBy = {
  popular: 'buy:desc',
  newest: undefined,
  priceAsc: 'price:asc',
  priceDesc: 'price:desc',
} as const;

const mapper = (item: ProductItemInput): ProductItemOutput => {
  let minPrice = item.price ?? Number.MAX_VALUE,
    maxPrice = item.price ?? Number.MIN_VALUE;
  if (item.variants.length) {
    item.variants.forEach((v) => {
      minPrice = Math.min(minPrice, v.price);
      maxPrice = Math.max(maxPrice, v.price);
    });
  }
  const variantProps = item.variantProps
    ? JSON.parse(item.variantProps as string)
    : undefined;
  const extraOptions = item.extraOptions
    ? JSON.parse(item.extraOptions as string)
    : undefined;
  return { ...item, minPrice, maxPrice, variantProps, extraOptions };
};

export const productMapper = (data: ProductMapperPayload, sort?: string) => {
  const sorter = (a: ProductItemOutput, b: ProductItemOutput) => {
    let vA: number, vB: number;
    switch (sort) {
      case ProductOrderBy.popular:
        return 0;
      case ProductOrderBy.priceAsc:
        vA = ((100 - (a.salePercent ?? 0)) * a.minPrice) / 100;
        vB = ((100 - (b.salePercent ?? 0)) * b.minPrice) / 100;
        return vA - vB;
      case ProductOrderBy.priceDesc:
        vA = ((100 - (a.salePercent ?? 0)) * a.maxPrice) / 100;
        vB = ((100 - (b.salePercent ?? 0)) * b.maxPrice) / 100;
        return vB - vA;
      default:
        return 0;
    }
  };

  if (Array.isArray(data)) {
    return data.map((item) => mapper(item)).sort(sorter);
  } else if (data['data'] && Array.isArray(data['data'])) {
    return {
      ...data,
      data: data['data']
        .map((item: ProductItemInput) => mapper(item))
        .sort(sorter),
    };
  } else {
    return mapper(data as ProductItemInput);
  }
};
