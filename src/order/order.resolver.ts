import { Resolver } from '@nestjs/graphql';
import { Order } from './entity/order.entity';
import { OrderService } from './order.service';

@Resolver((of) => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}
}
