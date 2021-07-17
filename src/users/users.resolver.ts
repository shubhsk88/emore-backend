import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import {
  CreateAccountOutput,
  CreateAccountInput,
} from './dtos/create-acount-dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UpdateProfileInput } from './dtos/update-accoun.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}
  @Query((returns) => String)
  hello(): string {
    return 'hi';
  }

  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const result = await this.usersService.createAccount(createAccountInput);
      return result;
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      const result = await this.usersService.login(loginInput);
      return result;
    } catch (error) {
      return { ok: false, error };
    }
  }

  @Query((returns) => User)
  @UseGuards(AuthGuard)
  async me(@AuthUser() user: User) {
    return user;
  }

  @Query((returns) => UserProfileOutput)
  @UseGuards(AuthGuard)
  async userProfile(
    @Args('data') userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.usersService.findById(userProfileInput.userId);
      if (!user) {
        throw new Error();
      }
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: 'User not found' };
    }
  }

  @Mutation((returns) => MutationOutput)
  @UseGuards(AuthGuard)
  async updateProfile(
    @Args('data') updateProfileData: UpdateProfileInput,
    @AuthUser() user: User,
  ): Promise<MutationOutput> {
    if (!user) return { ok: false, error: "User doesn't exist" };
    try {
      return await this.usersService.updateProfile(user.id, updateProfileData);
    } catch (error) {
      return { ok: false, error };
    }
  }
}
