import { Prisma } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto/product.input';
import { BadRequestException } from '@nestjs/common';

export const calcPrice = (price?: number, salePercent?: number) => {
  return price ? price * (1 - (salePercent ?? 0) / 100) : undefined;
};

export const transformPayload = <T extends CreateProductDto | UpdateProductDto>(
  data: T,
  slug?: string,
) => {
  if (
    isNaN(Number(data.price)) &&
    !(data.variantProps?.length && data.variants?.length)
  ) {
    throw new BadRequestException('Price or variants must be provided');
  }

  const transformedData: Prisma.ProductUpdateInput = {
    ...data,
    extraOptions: data.extraOptions
      ? JSON.stringify(data.extraOptions)
      : undefined,
    variantProps: undefined,
    variants: undefined,
    slug,
    actualAvgPrice: calcPrice(data.price, data.salePercent),
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
    transformedData.actualAvgPrice = calcPrice(avgPrice, data.salePercent);
  }

  return transformedData as T extends CreateProductDto
    ? Prisma.ProductCreateInput
    : Prisma.ProductUpdateInput;
};
