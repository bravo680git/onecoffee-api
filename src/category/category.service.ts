import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.input';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  create(payload: CreateCategoryDto) {
    return this.prisma.category.create({ data: payload });
  }

  findAll() {
    return this.prisma.category.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: number) {
    try {
      return await this.prisma.category.findUniqueOrThrow({ where: { id } });
    } catch {
      throw new NotFoundException();
    }
  }

  async update(id: number, payload: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: payload });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }
}
