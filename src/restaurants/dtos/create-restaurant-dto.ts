import { Field, InputType, OmitType } from '@nestjs/graphql';

import { Restaurant } from '../entities/restaurant';

@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {}
