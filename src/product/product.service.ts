import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>) {}

  async create(createProductDto: CreateProductDto, session?: ClientSession): Promise<Product> {
    const existing = await this.productModel
      .findOne({ name: createProductDto.name })
      .session(session ?? null)
      .exec();

    if (existing) {
      throw new BadRequestException(`Product with name "${createProductDto.name}" already exists`);
    }

    const createdProduct = new this.productModel(createProductDto);

    try {
      return await createdProduct.save({ session: session ?? null });
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException(`Product with name "${createProductDto.name}" already exists`);
      }
      throw err;
    }
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string, session?: ClientSession): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid product ID');
    }

    const product = await this.productModel
      .findById(id)
      .session(session ?? null)
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, session?: ClientSession): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid product ID');
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .session(session ?? null)
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return updatedProduct;
  }

  async remove(id: string, session?: ClientSession): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid product ID');
    }

    const result = await this.productModel
      .findByIdAndDelete(id)
      .session(session ?? null)
      .exec();

    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
