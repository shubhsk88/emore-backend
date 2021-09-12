import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-acount-dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';

import { JwtService } from 'src/jwt/jwt.service';
import { UpdateProfileInput } from './dtos/update-accoun.dto';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import { Verification } from './entities/verification.entity';

import { VerifyEmailnput } from './dtos/verify-email.dto';
import { MailService } from 'src/mail/mail.service';
import { UserProfileOutput } from './dtos/user-profile.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );

      const verification = await this.verifications.save(
        this.verifications.create({ user }),
      );
      // console.log(user, verification);
      await this.mailService.sendVerificationEmail(
        'info@mg.shubhski.dev',
        verification.code,
        email,
      );
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Something went wrong. Please try again' };
    }
  }
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const existingUser = await this.users.findOne(
        { email },
        { select: ['password', 'id'] },
      );
      if (!existingUser) {
        return { ok: false, error: 'User not found' };
      }
      const isPasswordCorrect = await existingUser.checkPassword(password);
      if (!isPasswordCorrect) {
        return { ok: false, error: 'The username or password is wrong' };
      }
      const token = this.jwtService.sign(existingUser.id);

      return { ok: true, token };
    } catch (error) {
      return { ok: false, error: 'Something went wrong' };
    }
  }
  async findById(userId: number): Promise<UserProfileOutput> {
    const user = await this.users.findOne(userId, {
      relations: ['restaurants'],
    });

    if (!user) {
      return { ok: false, error: "User doesn't exist" };
    }
    return { ok: true, user };
  }
  async updateProfile(
    userId: number,
    { email, password }: UpdateProfileInput,
  ): Promise<MutationOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (email) {
        user.email = email;
        user.verified = false;
        await this.verifications.delete({ user: { id: userId } });
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        this.mailService.sendVerificationEmail(email, verification.code, email);
      }
      if (password) {
        user.password = password;
      }
      this.users.save(user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Something went wrong' };
    }
  }
  async verifyEmail({ code }: VerifyEmailnput): Promise<MutationOutput> {
    try {
      const verified = await this.verifications.findOneOrFail(
        { code },
        {
          relations: ['user'],
        },
      );

      if (verified) {
        verified.user.verified = true;
        await this.users.save(verified.user);
        await this.verifications.delete(verified.id);
        return { ok: true };
      }
    } catch (error) {
      return { ok: false, error: 'The verification code is incorrect' };
    }
  }
}
