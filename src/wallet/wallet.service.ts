import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet, WalletDocument } from './utils/wallet.model';
import { Model, ClientSession } from 'mongoose';
import { TransactionService } from 'src/common/transaction/transaction.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    private readonly transactionService: TransactionService,
  ) {}

  private async getWallet(
    userId: string,
    session?: ClientSession,
  ): Promise<WalletDocument> {
    const wallet = await this.walletModel
      .findOne({ userId })
      .session(session || null);
    if (!wallet)
      throw new NotFoundException(`Wallet not found for user ${userId}`);
    return wallet;
  }

  async deposit(userId: string, amount: number): Promise<WalletDocument> {
    return this.transactionService.withTransaction(async (session) => {
      let wallet = await this.walletModel.findOne({ userId }).session(session);

      if (wallet) {
        wallet.deposit(amount);
      } else {
        wallet = new this.walletModel({ userId, balance: amount });
      }

      await wallet.save({ session });
      return wallet;
    });
  }

  async withdraw(userId: string, amount: number): Promise<WalletDocument> {
    return this.transactionService.withTransaction(async (session) => {
      const wallet = await this.getWallet(userId, session);

      try {
        wallet.withdraw(amount);
      } catch (err) {
        throw new BadRequestException(err.message);
      }

      await wallet.save({ session });
      return wallet;
    });
  }

  async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
  ): Promise<{ fromWallet: WalletDocument; toWallet: WalletDocument }> {
    return this.transactionService.withTransaction(async (session) => {
      const [fromWallet, toWallet] = await Promise.all([
        this.getWallet(fromUserId, session),
        this.getWallet(toUserId, session),
      ]);

      try {
        fromWallet.withdraw(amount);
        toWallet.deposit(amount);
      } catch (err) {
        throw new BadRequestException(err.message);
      }

      await Promise.all([
        fromWallet.save({ session }),
        toWallet.save({ session }),
      ]);

      return { fromWallet, toWallet };
    });
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getWallet(userId);
    return wallet.balance;
  }
}
