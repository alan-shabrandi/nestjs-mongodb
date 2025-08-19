import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async create(
    @Body() body: { userId: string; product: string; price: number },
  ) {
    return this.orderService.createOrder(body.userId, body.product, body.price);
  }
}
