import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/order/entity/order.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

@ObjectType()
@InputType('DishChoiceInputType', { isAbstract: true })
export class DishChoice {
  @Field((type) => String)
  name: string;

  @Field((type) => Number, { nullable: true })
  extra: number;
}

@ObjectType()
@InputType('DishOptionInputType', { isAbstract: true })
export class DishOptions {
  @Field((type) => String)
  name: string;
  @Field((type) => [DishChoice], { nullable: true })
  choices?: DishChoice[];

  @Field((type) => Number, { nullable: true })
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  name: string;

  @Field((type) => Float)
  @Column({ type: 'float' })
  price: number;

  @Field((type) => String)
  @Column({ nullable: true })
  @IsString()
  photo: string;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  @Length(5, 140)
  description?: string;

  @Field((type) => Restaurant)
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field((type) => [DishOptions], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOptions[];

  @Field((type) => [Order])
  @ManyToMany(() => Order)
  @JoinTable()
  orders: Order[];
}
