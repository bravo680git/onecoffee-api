import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bull';
import { MailProcessor } from './mail.processor';
import { MAIL_QUEUE_KEY } from './mail.constant';

@Module({
  imports: [
    BullModule.registerQueue({
      name: MAIL_QUEUE_KEY,
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnComplete: true,
      },
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
