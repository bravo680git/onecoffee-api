import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { ConfigModule } from '@nestjs/config';
import { BannerModule } from './banner/banner.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { BlogModule } from './blog/blog.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    CoreModule,
    ConfigModule.forRoot({ isGlobal: true }),
    BannerModule,
    CategoryModule,
    BrandModule,
    BlogModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
