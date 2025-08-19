import { prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';

export class Order {
  @prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @prop({ required: true })
  product: string;

  @prop({ required: true })
  price: number;
}
