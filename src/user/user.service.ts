import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LoginUserDto, RegisterUserDto } from './utils/user.dto';
import { Model } from 'mongoose';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserDocument } from './utils/user.type';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,
  ) {}

  async register(createUserDto: RegisterUserDto) {
    const { email, fullName, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new ConflictException('Email already in use');

    const newUser = new this.userModel({ email, fullName, password });
    return newUser.save();
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      throw new NotFoundException('Invalid credentials');

    return user;
  }

  async findById(userId: string) {
    return await this.userModel.findById(userId).exec();
  }

  async usersList(
    role?: UserRole,
    search?: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    order: 'asc' | 'desc' = 'asc',
    fields?: string,
    includeDeleted: boolean = false,
  ) {
    const filter: any = {};

    if (!includeDeleted) filter.isDeleted = { $ne: true };
    if (role) filter.role = role;

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder;

    const query = this.userModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sortObj);

    if (fields) query.select(fields);

    const [users, total] = await Promise.all([
      query.exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserPut(userId: string, updateUserDto: Partial<RegisterUserDto>) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.email = updateUserDto.email ?? user.email;
    user.fullName = updateUserDto.fullName ?? user.fullName;

    if (updateUserDto.password) user.password = updateUserDto.password;

    return await user.save();
  }

  async updateUserPatch(
    userId: string,
    partialUpdateDto: Partial<RegisterUserDto>,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (partialUpdateDto.email !== undefined)
      user.email = partialUpdateDto.email;
    if (partialUpdateDto.fullName !== undefined)
      user.fullName = partialUpdateDto.fullName;
    if (partialUpdateDto.password !== undefined)
      user.password = partialUpdateDto.password;

    return await user.save();
  }

  async softDeleteUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const timestamp = Date.now();
    user.email = `${user.email}.${timestamp}.deleted`;
    user.isDeleted = true;
    return await user.save();
  }

  async permanentDeleteUser(userId: string) {
    const result = await this.userModel.findByIdAndDelete(userId);
    if (!result) throw new NotFoundException('User not found');
    return { message: 'user permanently deleted' };
  }
}
