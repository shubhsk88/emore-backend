import { Field, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import { Payment } from '../entity/payment.entity';

@ObjectType()
export class GetPaymentsOutput extends MutationOutput {
  @Field((type) => [Payment])
  payments?: Payment[];
}
