import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { AdminJwtAuth } from 'src/auth';
import { ERROR_MESSAGES, MAX_SIZE } from './file.constant';

@Controller('admin/file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseGuards(AdminJwtAuth)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_SIZE,
            message: ERROR_MESSAGES.MAX_SIZE_EXCEED,
          }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('name') name: string,
  ) {
    return this.fileService.upload(file, name);
  }

  @Post('upload/fake')
  uploadFileFake() {
    return '';
  }
}
