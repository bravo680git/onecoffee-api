import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CATEGORY_TYPE_ID } from 'src/lib/utils/constant';
import { generateSlug, paginating } from 'src/lib/utils/helper';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.input';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  create(payload: CreateBlogDto) {
    payload.slug = generateSlug(payload.title);
    return this.prisma.blog.create({ data: payload });
  }

  async findAll(query?: RequestQuery) {
    return paginating(
      this.prisma.blog,
      {
        orderBy: { updatedAt: 'desc' },
        include: { category: true },
        where: {
          categoryId: Number(query?.category) || undefined,
        },
      },
      query,
    );
  }

  findOne(id: number) {
    return this.prisma.blog.findUniqueOrThrow({ where: { id } });
  }

  findOneBySlug(slug: string) {
    return this.prisma.blog.findUniqueOrThrow({
      where: { slug },
      include: { category: true },
    });
  }

  async findCategoriesBlogs(limit?: string) {
    return this.prisma.category.findMany({
      where: {
        parentId: CATEGORY_TYPE_ID.BLOG,
      },
      include: {
        blogs: {
          take: Number(limit) || undefined,
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            deletedAt: null,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async update(id: number, payload: UpdateBlogDto) {
    return this.prisma.blog.update({ where: { id }, data: payload });
  }

  async remove(id: number) {
    return this.prisma.blog.delete({ where: { id } });
  }
}
