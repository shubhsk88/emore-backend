import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import { Payment } from '../entity/payment.entity';

@InputType()
export class CreatePaymentInput extends PickType(Payment, [
  'restaurantId',
  'transactionId',
]) {}

@ObjectType()
export class CreatePaymentOutput extends MutationOutput {}
