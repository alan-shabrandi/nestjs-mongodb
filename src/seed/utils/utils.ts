// utils/utils.ts
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/utils/user.type';
import { UserRole } from 'src/common/enums/user-role.enum';
import { faker } from '@faker-js/faker';
import * as argon2 from 'argon2';

interface GenerateOptions {
  total: number;
  admins?: number;
}

export async function generateRandomUsers(
  userModel: Model<UserDocument>, // changed from ModelType<User>
  options: GenerateOptions,
) {
  const { total, admins = 1 } = options;
  if (admins > total)
    throw new Error('Number of admins cannot exceed total users');

  const users: Partial<UserDocument>[] = [];
  const emailSet = new Set<string>();

  for (let i = 0; i < total; i++) {
    console.log('i', i);
    let email: string;

    if (i < admins) {
      email = `admin${i + 1}@company.com`;
    } else {
      do {
        email = faker.internet.email().toLowerCase();
      } while (emailSet.has(email));
    }

    emailSet.add(email);

    const hashedPassword = await argon2.hash('123456');
    const role = i < admins ? UserRole.Admin : UserRole.User;

    users.push({
      fullName: faker.person.fullName(),
      email,
      password: hashedPassword,
      role,
      isDeleted: faker.datatype.boolean(),
      age: faker.number.int({ min: 18, max: 70 }),
    });
  }

  return userModel.insertMany(users);
}
