import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/utils/user.type';
import { generateRandomUsers } from './utils/utils';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}
  async seedUsers(total: number = 100, admins: number = 3) {
    const existingUsers = await this.userModel.countDocuments();
    if (existingUsers > 0)
      return console.log('Users already exist, skipping seeding');

    const users = await generateRandomUsers(this.userModel, {
      total,
      admins,
    });
    console.log(`Seeded ${users.length} users successfully`);
  }
}
