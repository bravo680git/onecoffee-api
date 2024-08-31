import { renderFile } from 'ejs';
import { join } from 'path';

export type MailTemplateType = 'admin-otp';

export type MailTemplateData = {
  'admin-otp': {
    name: string;
    otp: string;
    expirationTime: number;
  };
};

const MAIL_SUBJECTS: Record<MailTemplateType, string> = {
  'admin-otp': 'Login to ONe Coffee Admin Manager system',
};

export const generateMailTemplate = async (
  type: MailTemplateType,
  data: MailTemplateData[MailTemplateType],
) => {
  const templatePath = join(__dirname, 'templates', `${type}.ejs`);

  const html = await renderFile(templatePath, data);
  return {
    html,
    subject: MAIL_SUBJECTS[type],
  };
};
