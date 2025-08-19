import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from './utils/order.schema';
import { OrderService } from './order.service';
import { WalletSchema } from 'src/wallet/utils/wallet.model';
import { TransactionModule } from 'src/common/transaction/transaction.module';
import { OrderController } from './order.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
      { name: 'Wallet', schema: WalletSchema },
    ]),
    TransactionModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
