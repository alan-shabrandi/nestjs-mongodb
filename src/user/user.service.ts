import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserDocument } from './utils/user.type';
import { RegisterUserDto } from 'src/auth/utils/auth.dto';
import { PaginationOptions } from 'src/common/utils/pagination';
import { QueryBuilder } from 'src/common/utils/query-builder';
import { GetUserDto } from './utils/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,
  ) {}

  private async findUserOrThrow(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findById(userId: string) {
    return this.findUserOrThrow(userId);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  private async usersList(
    role?: UserRole,
    search?: string,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order: 'asc' | 'desc' = 'asc',
    fields?: string,
    includeDeleted = false,
    userIds?: string[],
  ) {
    const qb = new QueryBuilder<UserDocument>(this.userModel)
      .excludeDeleted(includeDeleted)
      .filterBy('role', role)
      .search(['fullName', 'email'], search)
      .sort(sortBy, order)
      .paginate({ page, limit });

    if (userIds?.length) {
      qb.filterByIds(userIds);
    }

    if (fields) qb.select(fields);

    const result = await qb.exec();
    return {
      users: result.items,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }

  async usersListForUser(
    currentUser: { userId: string; role: UserRole },
    query: GetUserDto,
  ) {
    const qb = new QueryBuilder<UserDocument>(this.userModel)
      .excludeDeleted(query.includeDeleted === 'true')
      .search(['fullName', 'email'], query.search)
      .sort(
        query.sortBy ?? 'createdAt',
        (query.order as 'asc' | 'desc') ?? 'asc',
      )
      .paginate({ page: query.page ?? 1, limit: query.limit ?? 10 });
    if (query.fields) qb.select(query.fields);

    if (currentUser.role === UserRole.Admin && query.role)
      qb.filterBy('role', query.role);
    else if (currentUser.role !== UserRole.Admin)
      qb.filterByIds([currentUser.userId]);

    const result = await qb.exec();
    return {
      users: result.items,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }

  private async updateUser(
    userId: string,
    updateDto: Partial<RegisterUserDto>,
    isPatch = false,
  ) {
    const user = await this.findUserOrThrow(userId);

    if (isPatch) {
      if (updateDto.email !== undefined) user.email = updateDto.email;
      if (updateDto.fullName !== undefined) user.fullName = updateDto.fullName;
      if (updateDto.password !== undefined) user.password = updateDto.password;
    } else {
      user.email = updateDto.email ?? user.email;
      user.fullName = updateDto.fullName ?? user.fullName;
      if (updateDto.password) user.password = updateDto.password;
    }

    return user.save();
  }

  async updateUserPut(userId: string, dto: Partial<RegisterUserDto>) {
    return this.updateUser(userId, dto, false);
  }

  async updateUserPatch(userId: string, dto: Partial<RegisterUserDto>) {
    return this.updateUser(userId, dto, true);
  }

  async softDeleteUser(userId: string) {
    const user = await this.findUserOrThrow(userId);
    const timestamp = Date.now();
    user.email = `${user.email}.${timestamp}.deleted`;
    user.isDeleted = true;
    return user.save();
  }

  async permanentDeleteUser(userId: string) {
    const result = await this.userModel.findByIdAndDelete(userId);
    if (!result) throw new NotFoundException('User not found');
    return { message: 'user permanently deleted' };
  }
}
