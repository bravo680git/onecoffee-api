import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FileResponseDto } from './dto/file.response';
import { generateUId } from 'src/lib/utils/helper';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class FileService {
  client: S3Client;
  bucketName: string;
  bucketUrl: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
      },
    });
    this.bucketName = process.env.S3_BUCKET_NAME ?? '';
    this.bucketUrl = process.env.S3_URL ?? '';
  }

  getFileUrl(fileName: string) {
    return this.bucketUrl.replace(/\/$/, '') + '/' + fileName;
  }

  async upload(file: Express.Multer.File, name: string) {
    const fileName = (name || file.filename) + generateUId();

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        }),
      );
      return new FileResponseDto(fileName, this.getFileUrl(fileName));
    } catch (error) {
      throw new InternalServerErrorException(
        process.env.DEV === 'true' ? error : undefined,
      );
    }
  }
}
