import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  AdminCategoryController,
  CategoryController,
} from './category.controller';

@Module({
  controllers: [CategoryController, AdminCategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
