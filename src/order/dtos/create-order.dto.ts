import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import { DishOptions } from 'src/restaurants/entities/dish.entity';
import { OrderItemOption } from '../entity/order-item.entity';
import { Order } from '../entity/order.entity';

@InputType()
export class CreateOrderItemInput {
  @Field((type) => Int)
  dishId: number;

  @Field((type) => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field((type) => Int)
  restaurantId: number;

  @Field((type) => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends MutationOutput {}
