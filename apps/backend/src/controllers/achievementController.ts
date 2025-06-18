import { Request, Response, NextFunction } from 'express';
import Achievement from '../models/Achievement';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getAllAchievements = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const achievements = await Achievement.find({ schoolId }).sort({ year: -1 });
        res.status(200).json({ data: achievements });
    } catch (error) {
        next(error);
    }
};

export const createAchievement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { title, description, year, level, achievedBy } = req.body;
        const schoolId = req.user?.schoolId;
        const newAchievement = new Achievement({
            title, description, year, level, achievedBy,
            addedBy: req.user?.id,
            schoolId,
        });
        const createdAchievement = await newAchievement.save();
        res.status(201).json({ message: 'Pencapaian berhasil ditambahkan.', data: createdAchievement });
    } catch (error) {
        next(error);
    }
};

export const deleteAchievement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const achievement = await Achievement.findOne({ _id: req.params.id, schoolId });
        if (!achievement) {
            res.status(404);
            throw new Error('Pencapaian tidak ditemukan');
        }
        await achievement.deleteOne();
        res.status(200).json({ message: 'Pencapaian berhasil dihapus.' });
    } catch (error) {
        next(error);
    }
};
