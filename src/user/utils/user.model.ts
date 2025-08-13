import { prop } from '@typegoose/typegoose';
import { UserRole } from 'src/common/enums/user-role.enum';

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

  @prop({ default: false })
  isDeleted: boolean;

  @prop()
  refreshToken?: string | null;

  @prop()
  age?: number;
}
