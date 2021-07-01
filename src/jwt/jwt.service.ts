import { Global, Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './interfaces/jwt-module-options';
import { CONFIG_OPTIONS } from './jwt.constant';

@Injectable()
@Global()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {
    console.log(options);
  }
  hello() {
    console.log('hijk');
  }
}
