import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders';
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
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishs.findOne(item.dishId);
        if (!dish) {
          return { ok: false, error: 'Dish not found' };
        }

        if (!item.options || !dish.options) {
          return { ok: false, error: 'Wrong choices provided' };
        }
        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (option) => option.name === itemOption.name,
          );

          if (!dishOption)
            return { ok: false, error: "The choice category doesn't exists" };
          if (dishOption.extra) {
            dishFinalPrice += dishOption.extra;
          } else {
            const choiceOption = dishOption.choices.find(
              (choice) => choice.name === itemOption.choice,
            );
            dishFinalPrice += choiceOption.extra;
          }
        }
        orderFinalPrice += dishFinalPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({ dish, options: item.options }),
        );
        orderItems.push(orderItem);
      }

      const order = await this.orders.save(
        this.orders.create({
          restaurant,
          customer,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Unable to process the order' };
    }
  }
  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    let orders: Order[];
    if (user.role === UserRole.Client) {
      orders = await this.orders.find({ where: { customer: user } });
    } else if (user.role === UserRole.Delivery) {
      orders = await this.orders.find({ where: { driver: user } });
    } else {
      const restaurants = await this.restaurants.find({
        where: {
          owner: user,
        },
        relations: ['orders'],
      });
      orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
    }
    return { ok: true, orders };
  }
}
