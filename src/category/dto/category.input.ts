import { PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCategoryDto implements Prisma.CategoryUncheckedCreateInput {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  image?: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
