import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { getModelForClass, prop, ReturnModelType } from '@typegoose/typegoose';
import { Document, HydratedDocument, Types } from 'mongoose';

@Schema()
export class Wallet {
  @prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: string;

  @prop({ required: true, default: 0 })
  balance: number;

  deposit(amount: number) {
    if (amount <= 0) throw new Error('Deposit amount must be positive');
    this.balance += amount;
  }

  withdraw(amount: number) {
    if (amount <= 0) throw new Error('Withdrawal amount must be positive');
    if (this.balance < amount) throw new Error('Insufficient funds');
    this.balance -= amount;
  }
}

export type WalletModelType = ReturnModelType<typeof Wallet> & {
  findOrCreate(userId: string): Promise<WalletDocument>;
};

export const WalletModel = getModelForClass(Wallet) as WalletModelType;
export const WalletSchema = WalletModel.schema;
export type WalletDocument = HydratedDocument<Wallet>;

WalletModel.findOrCreate = async function (userId: string): Promise<WalletDocument> {
  let wallet = await this.findOne({ userId }).exec();

  if (!wallet) {
    wallet = new this({ userId, balance: 0 });
    await wallet.save();
  }

  return wallet as WalletDocument;
};
