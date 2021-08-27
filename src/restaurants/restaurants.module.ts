import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import {
  CategoryResolver,
  DishResolver,
  RestaurantResolver,
} from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  providers: [
    RestaurantResolver,
    RestaurantService,
    DishResolver,
    CategoryResolver,
  ],
  imports: [TypeOrmModule.forFeature([Restaurant, Category, Dish])],
})
export class RestaurantsModule {}
