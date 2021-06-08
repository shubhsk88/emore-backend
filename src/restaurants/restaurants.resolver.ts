import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant-dto';

@Resolver()
export class RestaurantResolver {
  @Query((returns) => Boolean)
  isBig() {
    return true;
  }

  @Mutation((returns) => Boolean)
  createRestaurant(@Args() createRestaurantDto: CreateRestaurantDto) {
    return true;
  }
}
