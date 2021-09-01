import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import { Order } from '../entity/order.entity';

@InputType()
export class CreateOrderInput extends PickType(Order, ['dishes']) {
  @Field((type) => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends MutationOutput {}
