import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { AdminBannerController, BannerController } from './banner.controller';

@Module({
  controllers: [BannerController, AdminBannerController],
  providers: [BannerService],
})
export class BannerModule {}
