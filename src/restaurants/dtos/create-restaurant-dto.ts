import { Field, InputType, ObjectType, OmitType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/mutation.dto';

import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends OmitType(Restaurant, [
  'id',
  'category',
]) {}

@ObjectType()
export class CreateRestaurantOutput extends MutationOutput {}
