import { Global, Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { JwtModuleOptions } from './interfaces/jwt-module-options';
import { CONFIG_OPTIONS } from './jwt.constant';

@Injectable()
@Global()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}
  sign(payload: Record<string, unknown>): string {
    return jwt.sign(payload, this.options.privateKey);
  }
}
