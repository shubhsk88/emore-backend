import { Global, Inject, Injectable } from '@nestjs/common';
import got from 'got';
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
    const form = new FormData();
    form.append('from', this.options.email);
    form.append('to', to);
    form.append('subject', subject);
    form.append('text', content);
    try {
      const response = await got(
        `https://api.mailgun.net/v3/${this.options.domain}{/message`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      console.log(response.body);
    } catch (error) {
      console.log(error);
    }
  }
}
