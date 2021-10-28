import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Payment } from './entity/payment.entity';
import { PaymentResolver } from './payment.resolver';
import { PaymentService } from './payment.service';

@Module({
  providers: [PaymentService, PaymentResolver],
  imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
})
export class PaymentsModule {}
