import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';

@Module({
  providers: [OrderResolver, OrderService],
  imports: [TypeOrmModule.forFeature([Order])],
})
export class OrderModule {}
