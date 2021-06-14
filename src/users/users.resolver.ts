import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateAccountOutput,
  CreateAccountInput,
} from './dtos/create-acount-dto';
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
  createAccount(@Args('input') createAccountInput: CreateAccountInput) {
    return true;
  }
}
