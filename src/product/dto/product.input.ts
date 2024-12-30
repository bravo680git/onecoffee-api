import { PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class VariantDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  values: string[];

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  stockQuantity?: number;
}

class VariantPropDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  values: string[];

  @IsString()
  @IsNotEmpty()
  type: string;
}

class ExtraOptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;
}

export class CreateProductDto
  implements
    Omit<
      Prisma.ProductUncheckedCreateInput,
      'variants' | 'variantProps' | 'extraOptions'
    >
{
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  salePercent?: number;

  @IsNumber()
  @IsOptional()
  stockQuantity?: number;

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsNumber()
  brandId?: number;

  @IsString()
  @IsOptional()
  seoKeyword?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  @IsBoolean()
  @IsOptional()
  pin?: boolean;

  @IsOptional()
  @IsArray()
  @Type(() => ExtraOptionDto)
  @ValidateNested({ each: true })
  extraOptions?: ExtraOptionDto[];

  @IsArray()
  @Type(() => VariantDto)
  @ValidateNested({ each: true })
  @IsOptional()
  variants?: VariantDto[];

  @IsOptional()
  @IsArray()
  @Type(() => VariantPropDto)
  @ValidateNested({ each: true })
  variantProps?: VariantPropDto[];

  slug: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class CreateProductRatingDto
  implements Omit<Prisma.RatingUncheckedCreateInput, 'userId' | 'productId'>
{
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(5)
  score: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  comment?: string;
}

export class UpdateProductRatingDto extends PartialType(
  CreateProductRatingDto,
) {}
