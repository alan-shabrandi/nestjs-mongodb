import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet } from './utils/wallet.model';
import { Model } from 'mongoose';
import { TransactionService } from 'src/common/transaction/transaction.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    private readonly transactionService: TransactionService,
  ) {}

  async deposit(userId: string, amount: number) {
    return this.transactionService.withTransaction(async (session) => {
      const wallet = await this.walletModel
        .findOne({ userId })
        .session(session);
      if (!wallet) throw new Error('Wallet not found');

      wallet.balance += amount;
      await wallet.save({ session });
      return wallet;
    });
  }

  async withdraw(userId: string, amount: number) {
    return this.transactionService.withTransaction(async (session) => {
      const wallet = await this.walletModel
        .findOne({ userId })
        .session(session);
      if (!wallet) throw new Error('Wallet not found');
      wallet.balance -= amount;
      await wallet.save({ session });
      return wallet;
    });
  }

  async transfer(fromUserId: string, toUserId: string, amount: number) {
    return this.transactionService.withTransaction(async (session) => {
      const fromWallet = await this.walletModel
        .findOne({ userId: fromUserId })
        .session(session);
      const toWallet = await this.walletModel
        .findOne({ userId: toUserId })
        .session(session);

      if (!fromWallet || !toWallet) throw new Error('Wallet not found');
      if (fromWallet.balance < amount) throw new Error('Insufficient funds');
      fromWallet.balance -= amount;
      toWallet.balance += amount;
      await fromWallet.save({ session });
      await toWallet.save({ session });
      return { fromWallet, toWallet };
    });
  }

  async getBalance(userId: string) {
    const wallet = await this.walletModel.findOne({ userId });
    if (!wallet) throw new Error('Wallet not found');
    return wallet.balance;
  }
}
