import { Injectable } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MAIL_QUEUE_KEY, SEND_MAIL_JOB_KEY } from './mail.constant';
import { MailPayload } from './mail';
import { generateMailTemplate, MailTemplateType } from './mail.helper';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(@InjectQueue(MAIL_QUEUE_KEY) private mailQueue: Queue) {
    this.transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      from: `ONe Coffee <${process.env.SMTP_USER}>`,
    });
  }

  async sendMail<T extends MailTemplateType>(type: T, data: MailPayload<T>) {
    const { email, data: payload } = data;
    const { subject, content } = await generateMailTemplate(type, payload);
    await this.mailQueue.add(SEND_MAIL_JOB_KEY, {
      email,
      subject,
      content,
    });
  }

  async processMail(job: { data: any }) {
    try {
      await this.transporter.sendMail({
        ...job.data,
      });
    } catch (error) {
      console.error(`Failed to send email:`, error);
    }
  }
}
