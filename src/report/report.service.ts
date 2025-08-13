import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/utils/user.type';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async countUsersByRole() {
    return this.userModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);
  }

  async averageAgeByRole() {
    return this.userModel.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: null,
          averageAge: { $avg: '$age' },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          averageAge: 1,
          total: 1,
          _id: 0,
        },
      },
    ]);
  }

  async deletedVsActive() {
    return this.userModel.aggregate([
      {
        $group: {
          _id: '$isDeleted',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          isDeleted: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);
  }

  async newestUsersCount(count: number) {
    return this.userModel.aggregate([
      {
        $sort: {
          created_at: -1,
        },
      },
      {
        $limit: count,
      },
      {
        $project: {
          _id: 0,
          fullName: 1,
          email: 1,
        },
      },
    ]);
  }

  async usersGroupedByMonthYear() {
    return this.userModel.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalUsers: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalUsers: 1,
        },
      },
    ]);
  }
}
