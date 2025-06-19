import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const users = await User.find({ schoolId: req.user?.schoolId }).select('-password');
        res.status(200).json({ data: users });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const schoolId = req.user?.schoolId;

        const userExists = await User.findOne({ $or: [{ email }, { phone }], schoolId: schoolId });
        if (userExists) {
            res.status(400);
            throw new Error('Email atau nomor telepon sudah terdaftar di sekolah ini');
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
            role,
            schoolId: schoolId,
        });

        if (user) {
            const userResponse = {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                schoolId: user.schoolId,
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
        const user = await User.findOne({ _id: req.params.id, schoolId: req.user?.schoolId });

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
        const user = await User.findOne({ _id: req.params.id, schoolId: req.user?.schoolId });

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

export const getUserByPhone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        let phone = req.params.phone;

        phone = phone.replace(/\D/g, '');

        if (phone.startsWith('62')) {
            phone = '0' + phone.slice(2);
        }
        
        // Asumsi: Bot API key tidak terikat pada satu sekolah, jadi perlu info sekolah
        // Untuk saat ini, kita akan asumsikan bot bekerja pada satu konteks sekolah yang
        // bisa di-pass atau di-config di masa depan.
        // Untuk sekarang, kita cari user berdasarkan nomor telepon saja.
        const user = await User.findOne({ phone: phone }).select('-password');

        if (!user) {
            res.status(404);
            throw new Error(`Pengguna dengan nomor telepon ${phone} tidak ditemukan.`);
        }

        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
};