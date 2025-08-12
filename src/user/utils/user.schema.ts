import { getModelForClass } from '@typegoose/typegoose';
import { User } from './user.model';
import * as argon2 from 'argon2';

export const UserModel = getModelForClass(User);
export const UserSchema = UserModel.schema;

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await argon2.hash(this.password);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return argon2.verify(this.password, candidatePassword);
};
