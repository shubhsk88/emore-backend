import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserResolver } from './users.resolver';
import { UserService } from './users.service';

@Module({
  providers: [UserResolver, UserService],
  imports: [TypeOrmModule.forFeature([User, Verification])],
  exports: [UserService],
})
export class UsersModule {}
