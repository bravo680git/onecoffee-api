import { PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto implements Prisma.BlogUncheckedCreateInput {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsString()
  @IsOptional()
  seoKeyword?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  slug: string;
}

export class UpdateBlogDto extends PartialType(CreateBlogDto) {}
