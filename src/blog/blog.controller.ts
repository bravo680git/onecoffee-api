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
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.input';
import { AuthGuard, AuthRoles, USER_ROLE } from 'src/auth';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  findAll(@Query() query: RequestQuery) {
    return this.blogService.findAll(query);
  }

  @Get('/by-category')
  findCategoriesBlogs(@Query() query?: RequestQuery) {
    return this.blogService.findCategoriesBlogs(query?.limit);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blogService.findOneBySlug(slug);
  }
}

@Controller('admin/blog')
@AuthRoles(USER_ROLE.ADMIN)
@UseGuards(AuthGuard)
export class AdminBlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  create(@Body() payload: CreateBlogDto) {
    return this.blogService.create(payload);
  }

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateBlogDto) {
    return this.blogService.update(+id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}
