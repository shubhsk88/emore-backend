import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { OrderItem } from './entity/order-item.entity';
import { Order } from './entity/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishs: Repository<Dish>,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    const restaurant = await this.restaurants.findOne(restaurantId);
    if (!restaurant) {
      return { ok: false, error: 'Restaurant not found' };
    }

    const orderSum = 0;
    for (const item of items) {
      const dish = await this.dishs.findOne(item.dishId);
      if (!dish) {
        return { ok: false, error: 'Dish not found' };
      }
    }

    // await this.orderItems.save(
    //   this.orderItems.create({ dish, options: item.options }),
    // );

    // const order = await this.orders.save(
    //   this.orders.create({ restaurant, customer }),
    // );
  }
}
