import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@sipas/types';

interface IUser {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'guru', 'kepala sekolah'],
    default: 'guru',
  },
}, { timestamps: true });

userSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error: any) {
    next(error);
  }
});

const User = model<IUserDocument>('User', userSchema);

export default User;