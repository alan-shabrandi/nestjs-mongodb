import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument } from './utils/order.type';
import { TransactionService } from 'src/common/transaction/transaction.service';
import { WalletDocument } from 'src/wallet/utils/wallet.model';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
    @InjectModel('Wallet') private readonly walletModel: Model<WalletDocument>,
    private readonly transactionService: TransactionService,
  ) {}

  async createOrder(userId: string, product: string, price: number) {
    return this.transactionService.withTransaction(async (session) => {
      const wallet = await this.walletModel
        .findOne({ userId })
        .session(session);
      if (!wallet) throw new NotFoundException('Wallet not found');

      try {
        wallet.withdraw(price);
      } catch (err) {
        throw new BadRequestException(err.message);
      }

      await wallet.save({ session });

      const order = new this.orderModel({ userId, product, price });
      await order.save({ session });

      return order;
    });
  }
}
