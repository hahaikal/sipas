import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

const temporaryUserStore: { [email: string]: any } = {};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, phone, password, role } = req.body;
    temporaryUserStore[email] = { name, phone, password, role };

    const result = await authService.registerUser(email, name, phone, password, role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const userData = temporaryUserStore[email];

    if (!userData) {
      res.status(400).json({ message: 'Sesi registrasi tidak ditemukan atau sudah kedaluwarsa.' });
      return;
    }

    const result = await authService.verifyOtpAndCreateUser(email, otp, userData);

    delete temporaryUserStore[email];

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
