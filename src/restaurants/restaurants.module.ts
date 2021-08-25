import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryResolver, RestaurantResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  providers: [RestaurantResolver, RestaurantService, CategoryResolver],
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
})
export class RestaurantsModule {}
