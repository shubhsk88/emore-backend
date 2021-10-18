import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.constant';

const pubsub = new PubSub();
@Global()
@Module({
  providers: [
    {
      useValue: pubsub,
      provide: PUB_SUB,
    },
  ],
  exports: [PUB_SUB],
})
export class CommonModule {}
