import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './utils/wallet.model';
import { WalletService } from './wallet.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
  ],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
