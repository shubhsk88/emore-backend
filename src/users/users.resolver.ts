import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role } from 'src/auth/role.decorator';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import {
  CreateAccountOutput,
  CreateAccountInput,
} from './dtos/create-acount-dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UpdateProfileInput } from './dtos/update-accoun.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailnput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}
  @Query((returns) => String)
  hello(): string {
    return 'hi';
  }

  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return await this.usersService.createAccount(createAccountInput);
  }

  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return await this.usersService.login(loginInput);
  }

  @Query((returns) => User)
  @Role(['Any'])
  async me(@AuthUser() user: User) {
    return user;
  }

  @Query((returns) => UserProfileOutput)
  @Role(['Any'])
  async userProfile(
    @Args('data') userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.usersService.findById(userProfileInput.userId);
      if (!user) {
        throw new Error();
      }
      return user;
    } catch (error) {
      return { ok: false, error: 'User not found' };
    }
  }

  @Mutation((returns) => MutationOutput)
  @Role(['Any'])
  async updateProfile(
    @Args('data') updateProfileData: UpdateProfileInput,
    @AuthUser() user: User,
  ): Promise<MutationOutput> {
    return await this.usersService.updateProfile(user.id, updateProfileData);
  }

  @Mutation((returns) => MutationOutput)
  async verifyEmail(
    @Args('input') verifyEmailInput: VerifyEmailnput,
  ): Promise<MutationOutput> {
    return await this.usersService.verifyEmail(verifyEmailInput);
  }
}
