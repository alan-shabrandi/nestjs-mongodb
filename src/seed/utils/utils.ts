import { Model } from 'mongoose';
import { UserDocument } from 'src/user/utils/user.type';
import { UserRole } from 'src/common/enums/user-role.enum';
import { faker } from '@faker-js/faker';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

interface GenerateOptions {
  total: number;
  admins?: number;
  chunkSize?: number;
  parallelLimit?: number;
}

export async function generateRandomUsers(
  userModel: Model<UserDocument>,
  { total, admins = 1, chunkSize = 10000, parallelLimit = 5 }: GenerateOptions,
) {
  if (admins > total) {
    throw new Error('Number of admins cannot exceed total users');
  }

  const hashedPassword = await argon2.hash('123456');

  const createBulkOps = (size: number, startIndex: number) => {
    const ops: any[] = [];

    for (let i = 0; i < size; i++) {
      const globalIndex = startIndex + i;
      const isAdmin = globalIndex < admins;
      ops.push({
        insertOne: {
          document: {
            fullName: faker.person.fullName(),
            email: isAdmin
              ? `admin${globalIndex + 1}@company.com`
              : `user-${uuidv4()}@example.com`,
            password: hashedPassword,
            role: isAdmin ? UserRole.Admin : UserRole.User,
            isDeleted: faker.datatype.boolean(),
            age: faker.number.int({ min: 18, max: 70 }),
          },
        },
      });
    }

    return ops;
  };

  const totalChunks = Math.ceil(total / chunkSize);
  let chunkIndex = 0;

  while (chunkIndex < totalChunks) {
    const batch: Promise<any>[] = [];

    for (let p = 0; p < parallelLimit && chunkIndex < totalChunks; p++) {
      const startIndex = chunkIndex * chunkSize;
      const size = Math.min(chunkSize, total - startIndex);
      const ops = createBulkOps(size, startIndex);

      batch.push(userModel.bulkWrite(ops, { ordered: false }));
      chunkIndex++;
    }

    await Promise.all(batch);
    console.log(
      `Inserted ${Math.min(chunkIndex * chunkSize, total)}/${total} users...`,
    );
  }

  console.log('✅ All users inserted successfully!');
}
