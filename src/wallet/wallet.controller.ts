import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit')
  async deposit(@Body() body: { userId: string; amount: number }) {
    return this.walletService.deposit(body.userId, body.amount);
  }

  @Post('withdraw')
  async withdraw(@Body() body: { userId: string; amount: number }) {
    return this.walletService.withdraw(body.userId, body.amount);
  }

  @Post('transfer')
  async transfer(
    @Body() body: { fromUserId: string; toUserId: string; amount: number },
  ) {
    return this.walletService.transfer(
      body.fromUserId,
      body.toUserId,
      body.amount,
    );
  }

  @Get(':userId')
  async balance(@Param('userId') userId: string) {
    return this.walletService.getBalance(userId);
  }
}
