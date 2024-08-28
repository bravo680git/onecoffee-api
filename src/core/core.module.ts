import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { MailModule } from './mail/mail.module';

@Global()
@Module({
  imports: [CacheModule.register(), MailModule],
  providers: [PrismaService],
  exports: [PrismaService, CacheModule, MailModule],
})
export class CoreModule {}
