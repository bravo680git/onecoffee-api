import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { AdminBlogController, BlogController } from './blog.controller';

@Module({
  controllers: [BlogController, AdminBlogController],
  providers: [BlogService],
})
export class BlogModule {}
