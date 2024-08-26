import { PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBannerDto implements Prisma.BannerCreateInput {
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  image: string;

  @IsOptional()
  caption?: string;

  @IsNotEmpty()
  link: string;

  @IsOptional()
  isActive?: boolean;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
