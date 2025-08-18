import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument } from './utils/order.type';
import { UserDocument } from 'src/user/utils/user.type';
import { TransactionService } from 'src/common/transaction/transaction.service';
import { Wallet } from 'src/wallet/utils/wallet.model';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
    @InjectModel('Wallet') private readonly walletModel: Model<Wallet>,
    private readonly transactionService: TransactionService,
  ) {}

  async createOrder(userId: string, product: string, price: number) {
    return this.transactionService.withTransaction(async (session) => {
      const wallet = await this.walletModel.findById(userId).session(session);

      if (!wallet) throw new Error('Wallet not found');
      if (wallet.balance < price) throw new Error('Insufficient balance');

      wallet.balance -= price;
      await wallet.save({ session });

      const order = await this.orderModel.create([{ userId, product, price }], {
        session,
      });

      return order[0];
    });
  }
}
