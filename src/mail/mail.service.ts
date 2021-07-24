import { Global, Inject, Injectable } from '@nestjs/common';

import * as Mailgun from 'mailgun-js';

import { CONFIG_OPTIONS } from '../common/common.constant';
import { EmailVars, MailModuleOptions } from './interfaces/mail.interfaces';

@Injectable()
@Global()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  private async sendEmail(
    subject: string,
    template: string,
    to: string,
    emailVar: EmailVars[],
  ) {
    const mailgun = Mailgun({
      apiKey: this.options.apiKey,
      domain: this.options.domain,
    });
    const str = emailVar.reduce(
      (acc, item) => (acc[item.key] = item.value),
      {},
    );

    const data = {
      from: this.options.email,
      to,
      subject,
      template,
      'h:X-Mailgun-Variables': JSON.stringify(str),
    };
    try {
      const result = await new Promise((resolve, reject) => {
        mailgun.messages().send(data, function (error, body) {
          if (body) {
            resolve(body);
          } else {
            reject(error);
          }
        });
      });
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }
  async sendVerificationEmail(email: string, code: string, to: string) {
    this.sendEmail('Verify your email', 'email-confirmation', to, [
      { key: 'username', value: email },
      { key: 'code', value: code },
    ]);
  }
}
