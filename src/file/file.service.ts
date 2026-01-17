import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { generateSlug } from 'src/lib/utils/helper';
import { FileResponseDto } from './dto/file.response';

@Injectable()
export class FileService {
  client: S3Client;
  bucketName: string;
  bucketUrl: string;

  constructor() {
    this.client = new S3Client({
      region: 'us-east-1',
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
    const fileName = generateSlug(name || file.filename);

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
      console.error('[File Service] Upload Error:', error);
      throw new InternalServerErrorException(
        process.env.DEV === 'true' ? error : undefined,
      );
    }
  }
}
