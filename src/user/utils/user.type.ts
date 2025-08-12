import { HydratedDocument } from 'mongoose';
import { User } from './user.model';

export type UserDocument = HydratedDocument<User> & {
  comparePassword(candidatePassword: string): Promise<boolean>;
};
