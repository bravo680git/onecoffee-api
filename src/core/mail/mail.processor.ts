import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MailService } from './mail.service';
import { MAIL_QUEUE_KEY, SEND_MAIL_JOB_KEY } from './mail.constant';

@Processor(MAIL_QUEUE_KEY)
export class MailProcessor {
  constructor(private readonly mailService: MailService) {}

  @Process(SEND_MAIL_JOB_KEY)
  async handleSendMail(job: Job) {
    await this.mailService.processMail(job);
  }
}
