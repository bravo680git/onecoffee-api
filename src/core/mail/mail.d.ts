import { MailTemplateData, MailTemplateType } from './mail.helper';

export type MailPayload<T extends MailTemplateType> = {
  email: string;
  data: MailTemplateData[T];
};
