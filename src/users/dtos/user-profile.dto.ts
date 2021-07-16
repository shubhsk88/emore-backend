import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import { User } from '../entities/user.entity';

@InputType()
export class UserProfileInput {
  @Field((type) => Number)
  userId: number;
}

@ObjectType()
export class UserProfileOutput extends MutationOutput {
  @Field((type) => User, { nullable: true })
  user?: User;
}
