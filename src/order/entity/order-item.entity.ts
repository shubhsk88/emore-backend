import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import {
  Dish,
  DishChoice,
  DishOptions,
} from 'src/restaurants/entities/dish.entity';

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field((type) => String)
  name: string;
  @Field((type) => DishChoice, { nullable: true })
  choice?: DishChoice;
  @Field((type) => Number, { nullable: true })
  extra?: number;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @ManyToOne((type) => Dish, (Dish) => Dish.orders, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  dish?: Dish;

  @Field((type) => [DishOptions], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOptions[];
}
