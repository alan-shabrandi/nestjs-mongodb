import { getModelForClass } from '@typegoose/typegoose';
import { Order } from './order.model';

export const OrderModel = getModelForClass(Order);
export const OrderSchema = OrderModel.schema;
