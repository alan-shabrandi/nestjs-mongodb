import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/utils/user.type';
import { generateRandomUsers } from './utils/utils';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async seedUsers(total = 500000, admins = 6): Promise<void> {
    try {
      const existingUsers = await this.userModel.countDocuments();
      if (existingUsers > 0) {
        this.logger.warn('Users already exist, skipping seeding.');
        return;
      }

      await generateRandomUsers(this.userModel, { total, admins });

      this.logger.log(
        `✅ Successfully seeded ${total} users (${admins} admins).`,
      );
    } catch (error) {
      this.logger.error('❌ Error during user seeding', error.stack);
      throw error;
    }
  }
}
