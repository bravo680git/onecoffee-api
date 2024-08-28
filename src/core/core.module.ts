import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [CacheModule.register()],
  providers: [PrismaService],
  exports: [PrismaService, CacheModule],
})
export class CoreModule {}
