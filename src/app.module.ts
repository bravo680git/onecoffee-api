import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { ConfigModule } from '@nestjs/config';
import { BannerModule } from './banner/banner.module';

@Module({
  imports: [CoreModule, ConfigModule.forRoot({}), BannerModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
