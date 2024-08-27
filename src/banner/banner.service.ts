import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.input';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  create(payload: CreateBannerDto) {
    return this.prisma.banner.create({ data: payload });
  }

  findAll() {
    return this.prisma.banner.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: number) {
    try {
      return await this.prisma.banner.findUniqueOrThrow({ where: { id } });
    } catch {
      throw new NotFoundException();
    }
  }

  async update(id: number, payload: UpdateBannerDto) {
    await this.findOne(id);
    return this.prisma.banner.update({ where: { id }, data: payload });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.banner.delete({ where: { id } });
  }
}
