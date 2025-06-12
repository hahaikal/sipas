import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

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

export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, role } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('Pengguna tidak ditemukan');
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.role = role || user.role;

        const updatedUser = await user.save();
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json({ message: 'Pengguna berhasil diperbarui.', data: userResponse });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('Pengguna tidak ditemukan');
        }

        if (req.user && req.user.id === user.id) {
            res.status(400);
            throw new Error('Anda tidak dapat menghapus akun Anda sendiri.');
        }

        await user.deleteOne();
        res.status(200).json({ message: 'Pengguna berhasil dihapus.' });
    } catch (error) {
        next(error);
    }
};