import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-acount-dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async createAccount({
    email,
    role,
    password,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const existingUser = await this.users.findOne({ email });

      if (existingUser) {
        return {
          ok: false,
          error:
            'This email is already register in the system.Please try login instead ',
        };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (error) {
      console.log(error);
      return { ok: false, error: 'Something went wrong. Please try again' };
    }
  }
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const existingUser = await this.users.findOne({ email });
      if (!existingUser) {
        return { ok: false, error: 'User not found' };
      }
      const isPasswordCorrect = await existingUser.checkPassword(password);
      if (!isPasswordCorrect) {
        return { ok: false, error: 'The username or password is wrong' };
      }
      const token = jwt.sign(
        { id: existingUser.id },
        this.config.get('JWT_SECRET'),
      );
      console.log(token);
      return { ok: true, token };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
