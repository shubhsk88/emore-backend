import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant-dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant-dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async getOrCreateCategory(name: string) {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /gi, '-');
    let category = await this.categories.findOne({
      slug: categorySlug,
    });
    if (!category) {
      category = await this.categories.save(
        this.categories.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const categoryName = createRestaurantInput.categoryName
        .trim()
        .toLowerCase();
      const categorySlug = categoryName.replace(/ /gi, '-');
      let category = await this.categories.findOne({
        slug: categorySlug,
      });
      if (!category) {
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName }),
        );
      }
      newRestaurant.category = category;

      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async editRestaurant(
    owner: User,
    id: number,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(id, {
        loadRelationIds: true,
      });
      if (!restaurant) return { ok: false, error: "Restaurant deosn't exist" };
      if (restaurant.ownerId !== owner.id) {
        return { ok: false, error: "YOu can't edit restaurant you don't own" };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Smething went wrong' };
    }
  }
}
