import { getModelForClass, prop } from '@typegoose/typegoose';
import { HydratedDocument, Types } from 'mongoose';

export class OrderItem {
  @prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @prop({ required: true })
  quantity!: number;
}

export class Order {
  @prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @prop({ type: () => [OrderItem], required: true })
  products!: OrderItem[];

  @prop({ required: true })
  totalPrice!: number;

  @prop({ default: 'pending' })
  status!: string;

  @prop()
  shippingAddress?: string;

  @prop({ default: Date.now })
  createdAt?: Date;

  @prop({ default: Date.now })
  updatedAt?: Date;
}

export const OrderModel = getModelForClass(Order);
export const OrderSchema = OrderModel.schema;
export type OrderDocument = HydratedDocument<Order>;
