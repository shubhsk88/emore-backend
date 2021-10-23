import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import { Order } from '../entity/order.entity';

@InputType()
export class TakeOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class TakeOrderOutput extends MutationOutput {}
