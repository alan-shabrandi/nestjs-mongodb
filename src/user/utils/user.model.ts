import { prop } from '@typegoose/typegoose';
import { UserRole } from 'src/utils/enums/user-role.enum';

export class User {
  @prop({ required: true, trim: true })
  fullName!: string;

  @prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @prop({ required: true })
  password!: string;

  @prop({ enum: UserRole, default: UserRole.User })
  role!: UserRole;

  @prop({ default: Date.now, immutable: true })
  createdAt: Date;
}
