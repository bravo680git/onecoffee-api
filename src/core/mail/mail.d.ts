import { MailTemplateData, MailTemplateType } from './mail.helper';

export type MailPayload<T extends MailTemplateType> = {
  to: string;
  data: MailTemplateData[T];
};
