import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { NEW_PENDING_ORDER, PUB_SUB } from 'src/common/common.constant';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto.';
import { OrderItem } from './entity/order-item.entity';
import { Order, OrderStatus } from './entity/order.entity';

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
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
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
      this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrder: { order, ownerId: restaurant.ownerId },
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Unable to process the order' };
    }
  }
  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: { customer: user, ...(status && { status }) },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: { driver: user, ...(status && { status }) },
        });
      } else {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
        if (status) {
          orders = orders.filter((order) => order.status === status);
        }
      }
      return { ok: true, orders };
    } catch (error) {
      return { ok: false, error: 'Something went wrong' };
    }
  }

  async getOrder(user: User, { id }: GetOrderInput): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(id, {
        relations: ['restaurant'],
      });
      if (!order) return { ok: false, error: 'Order not found' };

      if (
        order.customerId !== user.id &&
        order.driverId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return { ok: false, error: 'You are not allowed to see this order' };
      }
      return { ok: true, order };
    } catch (error) {
      return { ok: false, error: 'Something went wrong' };
    }
  }

  async editOrder(
    user: User,
    { status, id }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(id, {
        relations: ['restaurant'],
      });
      if (!order) return { ok: false, error: "Order doesn't exists" };
      if (
        order.customerId !== user.id &&
        order.driverId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return { ok: false, error: 'You are not allowed to edit this order' };
      }
      let canEdit = true;
      if (user.role === UserRole.Client) canEdit = false;
      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooked && status !== OrderStatus.Cooking)
          canEdit = false;
      }
      if (user.role === UserRole.Delivery) {
        if (status !== OrderStatus.Delivered && status !== OrderStatus.PickedUp)
          canEdit = false;
      }
      if (!canEdit)
        return { ok: false, error: 'You are not authorized to do this' };
      await this.orders.save([
        {
          id,
          status,
        },
      ]);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Something went wrong' };
    }
  }
}
