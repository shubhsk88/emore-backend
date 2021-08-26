import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class FindRestaurantInput {
  @Field((type) => Int)
  restaurantId?: number;
}

@ObjectType()
export class FindRestaurantOutput extends MutationOutput {
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
