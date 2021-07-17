import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
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
import { JwtService } from 'src/jwt/jwt.service';
import { UpdateProfileInput } from './dtos/update-accoun.dto';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,

    private readonly jwtService: JwtService,
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
      const token = this.jwtService.sign({ id: existingUser.id });

      return { ok: true, token };
    } catch (error) {
      return { ok: false, error: 'Something went wrong' };
    }
  }
  async findById(userId: number): Promise<User> {
    return this.users.findOne({ id: userId });
  }
  async updateProfile(
    userId: number,
    updateProfileInput: UpdateProfileInput,
  ): Promise<MutationOutput> {
    try {
      console.log(userId, updateProfileInput);
      await this.users.update(userId, { ...updateProfileInput });
      return { ok: true };
    } catch (error) {
      console.log(error);
      return { ok: false, error };
    }
  }
}
