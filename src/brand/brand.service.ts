import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.input';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  create(payload: CreateBrandDto) {
    return this.prisma.brand.create({ data: payload });
  }

  findAll() {
    return this.prisma.brand.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  findOne(id: number) {
    try {
      return this.prisma.brand.findUniqueOrThrow({ where: { id } });
    } catch {
      throw new NotFoundException();
    }
  }

  async update(id: number, payload: UpdateBrandDto) {
    await this.findOne(id);
    return this.prisma.brand.update({ where: { id }, data: payload });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.brand.delete({ where: { id } });
  }
}
