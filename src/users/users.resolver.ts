import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class UserResolver {
  @Query((returns) => String)
  hello(): string {
    return 'Hello';
  }
}
