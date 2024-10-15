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
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendMail<T extends MailTemplateType>(type: T, data: MailPayload<T>) {
    const { to, data: payload } = data;
    const { subject, html } = await generateMailTemplate(type, payload);
    await this.mailQueue.add(SEND_MAIL_JOB_KEY, {
      to,
      subject,
      html,
    });
  }

  async processMail(job: { data: { to: string } }) {
    try {
      await this.transporter.sendMail({
        from: `"ONe Coffee admin" ${process.env.SMTP_USER}`,
        ...job.data,
      });
      console.log('Send mail successfully to %s', job.data.to);
    } catch (error) {
      console.error(`Failed to send email:`, error);
    }
  }
}
