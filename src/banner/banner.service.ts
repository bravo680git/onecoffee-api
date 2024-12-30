import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.input';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  create(payload: CreateBannerDto) {
    return this.prisma.banner.create({ data: payload });
  }

  findAll(activeOnly?: boolean) {
    return this.prisma.banner.findMany({
      where: { isActive: activeOnly || undefined },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return await this.prisma.banner.findUniqueOrThrow({ where: { id } });
  }

  async update(id: number, payload: UpdateBannerDto) {
    return this.prisma.banner.update({ where: { id }, data: payload });
  }

  async remove(id: number) {
    return this.prisma.banner.delete({ where: { id } });
  }
}
