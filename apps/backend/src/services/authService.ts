import User, { IUserDocument } from '../models/User';
import Otp from '../models/Otp';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/token';
import { emailService } from './emailService';

export const registerUser = async (email: string, name: string, phone: string, password: string, role: string) => {
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    throw new Error('Email atau nomor telepon sudah terdaftar.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.findOneAndUpdate({ email }, { email, otp }, { upsert: true, new: true, setDefaultsOnInsert: true });

  await emailService.sendOtpEmail(email, otp);

  return { message: `Kode OTP telah dikirim ke ${email}. Silakan periksa email Anda.` };
};

export const verifyOtpAndCreateUser = async (email: string, otp: string, userData: any) => {
  const otpDoc = await Otp.findOne({ email, otp });

  if (!otpDoc) {
    throw new Error('OTP salah atau sudah kedaluwarsa.');
  }

  const { name, phone, password, role } = userData;
  const newUser = new User({ name, email, phone, password, role });
  await newUser.save();

  await Otp.deleteOne({ _id: otpDoc._id });

  return { message: 'Pendaftaran berhasil. Silakan login.' };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Email atau password salah.');
  }

  const isMatch = await bcrypt.compare(password, user.password as string);
  if (!isMatch) {
    throw new Error('Email atau password salah.');
  }

  const token = generateToken(user);

  const userResponse = user.toObject();
  delete userResponse.password;

  return { token, user: userResponse };
};