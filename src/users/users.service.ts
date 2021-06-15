import { Injectable } from '@nestjs/common';
import { Injector } from '@nestjs/core/injector/injector';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-acount-dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createAccount({ email, role, password }: CreateAccountInput) {
    try {
      const existingUser = await this.users.findOne({ email });

      if (existingUser) {
        return;
      }
      await this.users.save(this.users.create({ email, password, role }));
      return true;
    } catch (error) {}
  }
}
