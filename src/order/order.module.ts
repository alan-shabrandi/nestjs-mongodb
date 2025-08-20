import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './entities/order.entity';
import { ProductModule } from 'src/product/product.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]), ProductModule, WalletModule],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
