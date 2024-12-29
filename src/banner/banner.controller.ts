import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard, Auth, USER_ROLE } from 'src/auth';
import { BannerService } from './banner.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.input';

@Controller('banner')
@UseGuards(ApiKeyGuard)
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
@Auth(USER_ROLE.ADMIN)
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
