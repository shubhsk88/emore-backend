import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ILike, Like, Repository } from 'typeorm';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant-dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant-dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant-dto';
import {
  FindRestaurantInput,
  FindRestaurantOutput,
} from './dtos/find-restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
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

    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
        {
          loadRelationIds: true,
        },
      );
      if (!restaurant) return { ok: false, error: "Restaurant deosn't exist" };
      if (restaurant.ownerId !== owner.id) {
        return { ok: false, error: "YOu can't edit restaurant you don't own" };
      }
      let category: Category = null;
      if (editRestaurantInput.categoryName)
        category = await this.getOrCreateCategory(
          editRestaurantInput.categoryName,
        );
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Smething went wrong' };
    }
  }

  async deleteRestaurant(
    owner: User,
    deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const foundRestaurant = await this.restaurants.findOne(
        deleteRestaurantInput.restaurantId,
      );
      if (!foundRestaurant) {
        return {
          ok: false,
          error: "The restaurant doesn't exist",
        };
      }
      if (foundRestaurant.ownerId !== owner.id) {
        return { ok: false, error: 'You are not the owner of this restaurant' };
      }
      await this.restaurants.delete(deleteRestaurantInput.restaurantId);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: 'Something went wrong',
      };
    }
  }
  async allCategories() {
    try {
      const categories = await this.categories.find();
      return { ok: true, categories };
    } catch (error) {
      return {
        ok: false,
        error: "Couldn't load the categories",
      };
    }
  }
  countRestauarants(category: Category) {
    return this.restaurants.count({ category });
  }

  async restaurantByCategory({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return { ok: false, error: 'Category not found' };
      }
      const restaurants = await this.restaurants.find({
        where: { category },
        skip: (page - 1) * 25,
        take: 25,
      });
      category.restaurants = restaurants;
      const totalsRestaurants = await this.countRestauarants(category);
      const totalPages = Math.ceil(totalsRestaurants / 25);
      return { ok: true, category, totalPages };
    } catch (error) {
      return { ok: false, error: "Couldn' load the category" };
    }
  }

  async getRestaurants({ page }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const [totalsRestaurants, totalPages] =
        await this.restaurants.findAndCount({
          take: 25,
          skip: (page - 1) * 25,
        });
      if (!totalsRestaurants)
        return { ok: false, error: "Restaurants doesn't found" };

      return {
        ok: true,
        restaurants: totalsRestaurants,
        totalPages: Math.ceil(totalPages / 25),
      };
    } catch (error) {
      return { ok: false, error: "Couldn't load the restaurants" };
    }
  }

  async findRestaurant({
    restaurantId,
  }: FindRestaurantInput): Promise<FindRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],
      });
      if (!restaurant) return { ok: false, error: 'Restaurant not found' };
      return { ok: true, restaurant };
    } catch (error) {
      return { ok: false, error: "Couldn't load the restaurants" };
    }
  }

  async searchRestaurant({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: ILike(`%${query}%`),
        },
        take: 25,
        skip: (page - 1) * 25,
      });
      if (!restaurants) return { ok: false, error: 'Restaurant not found' };
      return {
        ok: true,
        restaurants,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return { ok: false, error: "Couldn't load the restaurants" };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId,
      );
      if (!restaurant) return { ok: false, error: "Restaurant doesn't exist" };

      if (restaurant.ownerId !== owner.id)
        return { ok: false, error: 'Unauthorized' };
      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Something went wrong' };
    }
  }
  async deleteDish(
    deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      await this.dishes.delete({ id: deleteDishInput.dishId });
      return { ok: true };
    } catch (error) {
      return {
        ok: 'False',
        error: 'Something went wrong please try again',
      };
    }
  }
}
