import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { generateSlug, paginator } from 'src/lib/utils/helper';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.input';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  create(payload: CreateBlogDto) {
    payload.slug = generateSlug(payload.title);
    return this.prisma.blog.create({ data: payload });
  }

  async findAll(query?: RequestQuery) {
    return paginator(
      this.prisma.blog,
      { orderBy: { updatedAt: 'desc' } },
      query,
    );
  }

  findOne(id: number) {
    try {
      return this.prisma.blog.findUniqueOrThrow({ where: { id } });
    } catch {
      throw new NotFoundException();
    }
  }

  findOneBySlug(slug: string) {
    try {
      return this.prisma.blog.findUniqueOrThrow({ where: { slug } });
    } catch {
      throw new NotFoundException();
    }
  }

  async update(id: number, payload: UpdateBlogDto) {
    await this.findOne(id);
    return this.prisma.blog.update({ where: { id }, data: payload });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.blog.delete({ where: { id } });
  }
}
