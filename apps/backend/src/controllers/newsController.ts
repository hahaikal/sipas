import { Response, NextFunction } from 'express';
import News from '../models/News';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const createNews = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { title, content, imageUrl } = req.body;
        const schoolId = req.user?.schoolId;

        const news = new News({
            title,
            content,
            imageUrl,
            author: req.user?.id,
            schoolId,
        });

        const createdNews = await news.save();
        res.status(201).json({ message: 'Berita berhasil dibuat.', data: createdNews });
    } catch (error) {
        next(error);
    }
};

export const getAllNews = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const news = await News.find({ schoolId }).sort({ createdAt: -1 }).populate('author', 'name');
        res.status(200).json({ data: news });
    } catch (error) {
        next(error);
    }
};

export const getNewsById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const news = await News.findOne({ _id: req.params.id, schoolId }).populate('author', 'name');
        if (news) {
            res.status(200).json({ data: news });
        } else {
            res.status(404).send({ message: 'Berita tidak ditemukan' });
        }
    } catch (error) {
        next(error);
    }
};

export const updateNews = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { title, content, imageUrl } = req.body;
        const schoolId = req.user?.schoolId;
        const news = await News.findOne({ _id: req.params.id, schoolId });

        if (news) {
            news.title = title || news.title;
            news.content = content || news.content;
            news.imageUrl = imageUrl || news.imageUrl;

            const updatedNews = await news.save();
            res.status(200).json({ message: 'Berita berhasil diperbarui.', data: updatedNews });
        } else {
            res.status(404).send({ message: 'Berita tidak ditemukan' });
        }
    } catch (error) {
        next(error);
    }
};

export const deleteNews = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const news = await News.findOne({ _id: req.params.id, schoolId });

        if (news) {
            await news.deleteOne();
            res.status(200).json({ message: 'Berita berhasil dihapus.' });
        } else {
            res.status(404).send({ message: 'Berita tidak ditemukan' });
        }
    } catch (error) {
        next(error);
    }
};