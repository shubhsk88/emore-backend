import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class EditDishInput extends PickType(PartialType(Dish), [
  'name',
  'description',
  'price',
  'photo',
  'options',
]) {
  @Field((type) => Int)
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends MutationOutput {}
