import { Global, Inject, Injectable } from '@nestjs/common';

import * as Mailgun from 'mailgun-js';

import { CONFIG_OPTIONS } from '../common/common.constant';
import { MailModuleOptions } from './interfaces/mail.interfaces';

@Injectable()
@Global()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  async sendEmail(subject: string, content: string, to: string) {
    const mailgun = Mailgun({
      apiKey: this.options.apiKey,
      domain: this.options.domain,
    });
    const data = {
      from: this.options.email,
      to,
      subject,
      template: 'email-confirmation',
      'h:X-Mailgun-Variables': '{"username": "Shubham","code":"123214"}',
    };
    try {
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
    } catch (error) {
      console.log(error);
    }
  }
}
