import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './entities/wallet.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Wallet', schema: WalletSchema }])],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [MongooseModule, WalletService],
})
export class WalletModule {}
