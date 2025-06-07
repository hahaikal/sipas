import jwt from 'jsonwebtoken';
import { IUserDocument } from '../models/User';

export const generateToken = (user: IUserDocument): string => {
  const secret = process.env.JWT_SECRET || 'your-default-secret-key';
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: '1d',
  });
};