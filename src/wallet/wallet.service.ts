import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet, WalletDocument } from './entities/wallet.entity';
import { Model, ClientSession } from 'mongoose';
import { TransactionService } from 'src/common/transaction/transaction.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    private readonly transactionService: TransactionService,
  ) {}

  // Internal method to get wallet with optional session
  private async getWallet(userId: string, session?: ClientSession): Promise<WalletDocument> {
    const wallet = await this.walletModel
      .findOne({ userId })
      .session(session ?? null)
      .exec();
    if (!wallet) throw new NotFoundException(`Wallet not found for user ${userId}`);
    return wallet;
  }

  // Deposit funds
  async deposit(userId: string, amount: number, session?: ClientSession): Promise<WalletDocument> {
    return this.transactionService.withTransaction(async (sess) => {
      const s = session ?? sess;
      let wallet = await this.walletModel.findOne({ userId }).session(s).exec();

      if (wallet) {
        wallet.deposit(amount);
      } else {
        wallet = new this.walletModel({ userId, balance: amount });
      }

      await wallet.save({ session: s });
      return wallet;
    });
  }

  // Withdraw funds
  async withdraw(userId: string, amount: number, session?: ClientSession): Promise<WalletDocument> {
    return this.transactionService.withTransaction(async (sess) => {
      const s = session ?? sess;
      const wallet = await this.getWallet(userId, s);

      try {
        wallet.withdraw(amount);
      } catch (err: any) {
        throw new BadRequestException(err.message);
      }

      await wallet.save({ session: s });
      return wallet;
    });
  }

  // Transfer funds between users
  async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<{ fromWallet: WalletDocument; toWallet: WalletDocument }> {
    return this.transactionService.withTransaction(async (sess) => {
      const s = session ?? sess;
      const [fromWallet, toWallet] = await Promise.all([this.getWallet(fromUserId, s), this.getWallet(toUserId, s)]);

      try {
        fromWallet.withdraw(amount);
        toWallet.deposit(amount);
      } catch (err: any) {
        throw new BadRequestException(err.message);
      }

      await Promise.all([fromWallet.save({ session: s }), toWallet.save({ session: s })]);

      return { fromWallet, toWallet };
    });
  }

  // Get wallet balance
  async getBalance(userId: string, session?: ClientSession): Promise<number> {
    const wallet = await this.getWallet(userId, session);
    return wallet.balance;
  }
}
