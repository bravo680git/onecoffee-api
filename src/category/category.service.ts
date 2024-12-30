import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.input';

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
    return await this.prisma.category.findUniqueOrThrow({ where: { id } });
  }

  async update(id: number, payload: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data: payload });
  }

  async remove(id: number) {
    return this.prisma.category.delete({ where: { id } });
  }
}
