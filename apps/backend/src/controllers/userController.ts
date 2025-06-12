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

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, password, role } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) {
            res.status(400);
            throw new Error('Email atau nomor telepon sudah terdaftar');
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
            role,
        });

        if (user) {
            const userResponse = {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            };
            res.status(201).json({ message: 'Pengguna berhasil dibuat.', data: userResponse });
        } else {
            res.status(400);
            throw new Error('Data pengguna tidak valid');
        }
    } catch (error) {
        next(error);
    }
};
