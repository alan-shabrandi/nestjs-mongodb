import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { prop } from '@typegoose/typegoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Wallet extends Document {
  @prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: string;

  @prop({ required: true, default: 0 })
  balance: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
