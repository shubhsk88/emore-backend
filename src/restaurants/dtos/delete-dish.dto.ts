import { Field, InputType, Int } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/mutation.dto';

@InputType()
export class DeleteDishInput {
  @Field((type) => Int)
  dishId: number;
}

export class DeleteDishOutput extends MutationOutput {}
