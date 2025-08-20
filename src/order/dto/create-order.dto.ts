import { IsString, IsNumber, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

export class OrderItemDto {
  productId: string;
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  userId: string;

  @IsArray()
  @ArrayNotEmpty()
  products: OrderItemDto[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  shippingAddress?: string;
}
