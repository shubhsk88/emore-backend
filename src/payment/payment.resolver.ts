import { Resolver } from '@nestjs/graphql';
import { Payment } from './entity/payment.entity';
import { PaymentService } from './payment.service';

@Resolver((of) => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}
}
