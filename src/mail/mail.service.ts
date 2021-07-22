import { Global, Inject, Injectable } from '@nestjs/common';

import * as Mailgun from 'mailgun-js';
import * as FormData from 'form-data';

import { CONFIG_OPTIONS } from '../common/common.constant';
import { MailModuleOptions } from './interfaces/mail.interfaces';

@Injectable()
@Global()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    this.sendEmail('Hello', 'World', 'shubham88singh@gmail.com');
  }

  async sendEmail(subject: string, content: string, to: string) {
    const mailgun = Mailgun({
      apiKey: this.options.apiKey,
      domain: this.options.domain,
    });
    const data = {
      from: this.options.email,
      to,
      subject,
      text: content,
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
