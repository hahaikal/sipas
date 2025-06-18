import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { redisClient } from '../config/redisClient';
import School from '../models/School';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, phone, password, role, subdomain } = req.body;
    const school = await School.findOne({ subdomain: subdomain });
    if (!school) {
      throw new Error(`Sekolah dengan subdomain "${subdomain}" tidak terdaftar.`);
    }
    const userData = { name, phone, password, role, schoolId: school._id };

    const redisKey = `registration:${email}`;

    await redisClient.set(redisKey, JSON.stringify(userData), { EX: 300 });

    const result = await authService.registerUser(email, name, phone, password, role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const redisKey = `registration:${email}`;
    
    const userDataString = await redisClient.get(redisKey);

    if (!userDataString) {
      res.status(400).json({ message: 'Sesi registrasi tidak ditemukan atau sudah kedaluwarsa.' });
      return;
    }
    const userData = JSON.parse(userDataString);

    const result = await authService.verifyOtpAndCreateUser(email, otp, userData);
    
    await redisClient.del(redisKey);
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
