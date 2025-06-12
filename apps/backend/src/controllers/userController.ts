import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({ data: users });
    } catch (error) {
        next(error);
    }
};
