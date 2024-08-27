import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  filterSoftDeleted,
  softDelete,
  softDeleteMany,
} from './prisma.extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({ log: process.env.DEV === 'true' ? ['info', 'query'] : [] });
  }

  async onModuleInit() {
    await this.$connect();
    const prismaClientWithExtensions = this.$extends(softDelete)
      .$extends(softDeleteMany)
      .$extends(filterSoftDeleted);
    Object.assign(this, prismaClientWithExtensions);
  }
}
