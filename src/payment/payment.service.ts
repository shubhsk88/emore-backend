import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dto/creat-payment.dto';
import { Payment } from './entity/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    { restaurantId, transactionId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant)
        return { ok: false, error: "This Restaurant doesn't exist" };
      if (restaurant.ownerId !== owner.id)
        return {
          ok: false,
          error: "This Restaurant doesn't belong to current user",
        };
      await this.payments.save(
        this.payments.create({ restaurant, transactionId, user: owner }),
      );
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Can't create the payment" };
    }
  }
}
