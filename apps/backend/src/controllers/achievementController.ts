import { Request, Response, NextFunction } from 'express';
import Achievement from '../models/Achievement';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// @desc    Get all achievements
// @route   GET /api/achievements
// @access  Public
export const getAllAchievements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const achievements = await Achievement.find({}).sort({ year: -1 });
        res.status(200).json({ data: achievements });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new achievement
// @route   POST /api/achievements
// @access  Private/Admin
export const createAchievement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { title, description, year, level, achievedBy } = req.body;
        const newAchievement = new Achievement({
            title, description, year, level, achievedBy,
            addedBy: req.user?.id,
        });
        const createdAchievement = await newAchievement.save();
        res.status(201).json({ message: 'Pencapaian berhasil ditambahkan.', data: createdAchievement });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an achievement
// @route   DELETE /api/achievements/:id
// @access  Private/Admin
export const deleteAchievement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
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