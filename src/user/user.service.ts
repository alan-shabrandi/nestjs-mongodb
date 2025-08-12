import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './utils/user.model';
import { LoginUserDto, RegisterUserDto } from './utils/user.dto';
import { Model } from 'mongoose';
import { UserRole } from 'src/utils/enums/user-role.enum';
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

  async usersList(role?: UserRole, search?: string): Promise<User[]> {
    const filter: any = {};
    if (role) filter.role = role;

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    return await this.userModel.find(filter).exec();
  }
}
