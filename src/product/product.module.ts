import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import {
  AdminProductController,
  ProductController,
} from './product.controller';

@Module({
  controllers: [ProductController, AdminProductController],
  providers: [ProductService],
})
export class ProductModule {}
