import { Prisma } from '@prisma/client';

type ProductItemInput = Prisma.ProductGetPayload<{
  include: { brand: true; category: true; variants: true; ratings: true };
}>;

type ProductItemOutput = Omit<ProductItemInput, ''> & {
  minPrice: number;
  maxPrice: number;
  avgRating?: number;
};

export type ProductMapperPayload =
  | ProductItemInput
  | ProductItemInput[]
  | { data: ProductItemInput[] };

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
  const avgRating = item.ratings?.length
    ? (item.ratings.reduce((acc, crr) => acc + crr.score, 0) ?? 0) /
      item.ratings.length
    : undefined;
  return { ...item, minPrice, maxPrice, variantProps, extraOptions, avgRating };
};

export const productMapper = (data: ProductMapperPayload) => {
  if (Array.isArray(data)) {
    return data.map((item) => mapper(item));
  } else if (data['data'] && Array.isArray(data['data'])) {
    return {
      ...data,
      data: data['data'].map((item: ProductItemInput) => mapper(item)),
    };
  } else {
    return mapper(data as ProductItemInput);
  }
};
