import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import {
  COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constant';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto.';
import { OrderUpdatesInput } from './dtos/order-updates.dto';
import { Order } from './entity/order.entity';
import { OrderService } from './order.service';

@Resolver((of) => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation((type) => CreateOrderOutput)
  @Role(['Client'])
  createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ) {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Query((type) => GetOrdersOutput)
  @Role(['Any'])
  getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrders(user, getOrdersInput);
  }

  @Query((type) => GetOrderOutput)
  @Role(['Any'])
  getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.orderService.getOrder(user, getOrderInput);
  }

  @Mutation((type) => EditOrderOutput)
  @Role(['Any'])
  editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.orderService.editOrder(user, editOrderInput);
  }

  // @Mutation((returns) => Boolean)
  // worldHello(@Args('userId') userId: number) {
  //   this.pubSub.publish('hello', {
  //     helloWorld: userId,
  //   });
  //   return true;
  // }

  @Role(['Owner'])
  @Subscription((type) => Order, {
    filter: ({ pendingOrder: { ownerId } }, _, { user }) => {
      return ownerId === user.id;
    },
    resolve: (payload) => payload.pendingOrder.order,
  })
  pendingOrder() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Role(['Delivery'])
  @Subscription((type) => Order)
  cookedOrder() {
    return this.pubSub.asyncIterator(COOKED_ORDER);
  }

  @Role(['Any'])
  @Subscription((type) => Order, {
    filter: (
      { orderUpdate }: { orderUpdate: Order },
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User },
    ) => {
      if (
        orderUpdate.driverId !== user.id &&
        orderUpdate.customerId !== user.id &&
        orderUpdate.restaurant.ownerId !== user.id
      )
        return false;
      return orderUpdate.id === input.id;
    },
  })
  orderUpdate(@Args('input') orderUpdateInput: OrderUpdatesInput) {
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
  }
  // @Subscription((type) => String, {
  //   filter: (payload, variables, context) => {
  //     return payload.helloWorld === variables.userId;
  //   },
  //   resolve: (payload) => `there is ${payload.helloWorld}`,
  // })
  // @Role(['Any'])
  // helloWorld(@Args('userId') userId: number) {
  //   return this.pubSub.asyncIterator('hello');
  // }
}
