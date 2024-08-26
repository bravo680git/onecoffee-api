import { PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBrandDto implements Prisma.BrandCreateWithoutProductsInput {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
