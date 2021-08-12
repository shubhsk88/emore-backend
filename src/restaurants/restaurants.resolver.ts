import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant-dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver()
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  @Query((returns) => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation((returns) => Boolean)
  createRestaurant(@Args('input') createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantService.createRestaurant(createRestaurantDto);
  }
}
