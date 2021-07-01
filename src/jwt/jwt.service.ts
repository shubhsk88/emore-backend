import { Global, Injectable } from '@nestjs/common';

@Injectable()
@Global()
export class JwtService {
  hello() {
    console.log('hello');
  }
}
