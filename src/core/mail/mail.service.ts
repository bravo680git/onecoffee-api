import { Injectable } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MAIL_QUEUE_KEY, SEND_MAIL_JOB_KEY } from './mail.constant';
import { MailPayload } from './mail';

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
    });
  }

  async sendMail(data: MailPayload) {
    const { content, email, subject } = data;
    await this.mailQueue.add(SEND_MAIL_JOB_KEY, {
      email,
      subject,
      content,
    });
  }

  async processMail(job: { data: MailPayload }) {
    const { email, subject, content } = job.data;
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject,
        text: content,
      });
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
    }
  }
}
