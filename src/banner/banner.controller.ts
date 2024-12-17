import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.input';
import { AdminAuthGuard } from 'src/auth';

@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}
  @Get()
  findAll() {
    return this.bannerService.findAll(true);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannerService.findOne(+id);
  }
}

@Controller('admin/banner')
@UseGuards(AdminAuthGuard)
export class AdminBannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  create(@Body() payload: CreateBannerDto) {
    return this.bannerService.create(payload);
  }

  @Get()
  findAll() {
    return this.bannerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateBannerDto) {
    return this.bannerService.update(+id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannerService.remove(+id);
  }
}
