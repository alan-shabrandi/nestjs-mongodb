import { HydratedDocument } from 'mongoose';
import { Order } from './order.model';

export type OrderDocument = HydratedDocument<Order>;
