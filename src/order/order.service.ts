import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductService } from '../product/product.service';
import { Order, OrderDocument, OrderItem } from './entities/order.entity';
import { TransactionService } from 'src/common/transaction/transaction.service';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly productService: ProductService,
    private readonly transactionService: TransactionService,
    private readonly walletService: WalletService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    return this.transactionService.withTransaction(async (session: ClientSession) => {
      const { userId, products, shippingAddress } = createOrderDto;

      const productDocs = await Promise.all(products.map((item) => this.productService.findOne(item.productId, session)));

      let totalPrice = 0;
      for (let i = 0; i < products.length; i++) {
        const product = productDocs[i];
        const quantity = products[i].quantity;

        if (product.stock < quantity) {
          throw new BadRequestException(`Product ${product.name} only has ${product.stock} items in stock`);
        }

        totalPrice += product.price * quantity;
      }

      const walletBalance = await this.walletService.getBalance(userId, session);
      if (walletBalance < totalPrice) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      await Promise.all(
        products.map((item, idx) => {
          const product = productDocs[idx];
          return this.productService.update((product._id as Types.ObjectId).toString(), { stock: product.stock - item.quantity }, session);
        }),
      );

      await this.walletService.withdraw(userId, totalPrice, session);

      const orderItems: OrderItem[] = products.map((item) =>
        Object.assign(new OrderItem(), {
          productId: new Types.ObjectId(item.productId),
          quantity: item.quantity,
        }),
      );

      const createdOrder = new this.orderModel({
        user: new Types.ObjectId(userId),
        products: orderItems,
        totalPrice,
        shippingAddress,
      });

      const order = await createdOrder.save({ session });
      if (!order) throw new Error('Failed to create order');

      return order.toObject({ versionKey: false });
    });
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().exec();
  }

  async findOne(id: string, session?: ClientSession): Promise<Order> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid order ID');

    const order = await this.orderModel
      .findById(id)
      .session(session ?? null)
      .exec();

    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  async update(id: string, updateOrderDto: Partial<CreateOrderDto>, session?: ClientSession): Promise<Order> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid order ID');

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .session(session ?? null)
      .exec();

    if (!updatedOrder) throw new NotFoundException(`Order with ID ${id} not found`);
    return updatedOrder;
  }

  async remove(id: string, session?: ClientSession): Promise<void> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid order ID');

    const result = await this.orderModel
      .findByIdAndDelete(id)
      .session(session ?? null)
      .exec();

    if (!result) throw new NotFoundException(`Order with ID ${id} not found`);
  }
}
