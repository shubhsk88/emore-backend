import { Global, Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { JwtModuleOptions } from './interfaces/jwt-module-options';
import { CONFIG_OPTIONS } from '../common/common.constant';

@Injectable()
@Global()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}
  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.options.privateKey);
  }
  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
