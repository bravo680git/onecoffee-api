import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.input';

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
    return this.prisma.brand.findUniqueOrThrow({ where: { id } });
  }

  async update(id: number, payload: UpdateBrandDto) {
    return this.prisma.brand.update({ where: { id }, data: payload });
  }

  async remove(id: number) {
    return this.prisma.brand.delete({ where: { id } });
  }
}
