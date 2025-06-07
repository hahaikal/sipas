import User, { IUserDocument } from '../models/User';
import Otp from '../models/Otp';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/token';

// Fungsi untuk mendaftarkan user (tahap 1: buat OTP)
export const registerUser = async (email: string, name: string, phone: string, password: string, role: string) => {
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    throw new Error('Email atau nomor telepon sudah terdaftar.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Simpan atau update OTP di database
  await Otp.findOneAndUpdate({ email }, { email, otp }, { upsert: true, new: true, setDefaultsOnInsert: true });

  // Di sini, Anda akan mengirim OTP ke email pengguna. Untuk sekarang, kita log saja.
  console.log(`OTP untuk ${email} adalah: ${otp}`);

  // Simpan data user sementara untuk diverifikasi nanti (di sini kita tidak menyimpannya di memori lagi)
  // Kita akan membuat user setelah OTP diverifikasi.

  return { message: `Kode OTP telah dikirim ke ${email}. Silakan verifikasi.` };
};

// Fungsi untuk verifikasi OTP dan membuat user
export const verifyOtpAndCreateUser = async (email: string, otp: string, userData: any) => {
  const otpDoc = await Otp.findOne({ email, otp });

  if (!otpDoc) {
    throw new Error('OTP salah atau sudah kedaluwarsa.');
  }

  const { name, phone, password, role } = userData;
  const newUser = new User({ name, email, phone, password, role });
  await newUser.save();

  // Hapus OTP setelah berhasil digunakan
  await Otp.deleteOne({ _id: otpDoc._id });

  return { message: 'Pendaftaran berhasil. Silakan login.' };
};


// Fungsi untuk login user
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

  // Buat objek user tanpa password untuk dikirim kembali
  const userResponse = user.toObject();
  delete userResponse.password;

  return { token, user: userResponse };
};