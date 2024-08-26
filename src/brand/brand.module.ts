import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { AdminBrandController, BrandController } from './brand.controller';

@Module({
  controllers: [BrandController, AdminBrandController],
  providers: [BrandService],
})
export class BrandModule {}
