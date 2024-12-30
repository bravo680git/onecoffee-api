import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard, Auth, AuthUser, USER_ROLE } from 'src/auth';
import {
  CreateProductDto,
  CreateProductRatingDto,
  UpdateProductDto,
  UpdateProductRatingDto,
} from './dto/product.input';
import { ProductService } from './product.service';

@Controller('product')
@UseGuards(ApiKeyGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(@Query() query?: RequestQuery) {
    return this.productService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productService.findOneBySlug(slug);
  }

  @Post(':product-id/rating')
  @Auth(USER_ROLE.USER)
  createRating(
    @Body() payload: CreateProductRatingDto,
    @Param('product-id') productId: number,
    @AuthUser('sub') userId: number,
  ) {
    return this.productService.createRating(payload, productId, userId);
  }

  @Patch(':product-id/rating/:id')
  @Auth(USER_ROLE.USER)
  updateRating(
    @Param('id') id: number,
    @Body()
    payload: UpdateProductRatingDto,
    @Param('product-id') productId: number,
    @AuthUser('sub') userId: number,
  ) {
    return this.productService.updateRating(id, payload, productId, userId);
  }

  @Delete(':product-id/rating/:id')
  @Auth(USER_ROLE.USER)
  removeRating(
    @Param('id') id: number,
    @Param('product-id') productId: number,
    @AuthUser('sub') userId: number,
  ) {
    return this.productService.removeRating(id, productId, userId);
  }
}

@Controller('admin/product')
@Auth(USER_ROLE.ADMIN)
export class AdminProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() payload: CreateProductDto) {
    return this.productService.create(payload);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateProductDto) {
    return this.productService.update(+id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
