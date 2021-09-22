import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import { Order } from '../entity/order.entity';

@InputType()
export class EditOrderInput extends PickType(Order, ['id', 'status']) {}

@ObjectType()
export class EditOrderOutput extends MutationOutput {}
