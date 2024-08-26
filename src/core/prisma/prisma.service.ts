import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  filterSoftDeleted,
  softDelete,
  softDeleteMany,
} from './prisma.extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    const prismaClientWithExtensions = this.$extends(softDelete)
      .$extends(softDeleteMany)
      .$extends(filterSoftDeleted);
    Object.assign(this, prismaClientWithExtensions);
  }
}
