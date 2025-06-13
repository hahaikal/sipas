import { Request, Response, NextFunction } from 'express';
import News from '../models/News';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// @desc    Create a news article
// @route   POST /api/news
// @access  Private/Admin
export const createNews = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { title, content, imageUrl } = req.body;

        const news = new News({
            title,
            content,
            imageUrl,
            author: req.user?.id,
        });

        const createdNews = await news.save();
        res.status(201).json({ message: 'Berita berhasil dibuat.', data: createdNews });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all news articles
// @route   GET /api/news
// @access  Public
export const getAllNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const news = await News.find({}).sort({ createdAt: -1 }).populate('author', 'name');
        res.status(200).json({ data: news });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single news article by ID
// @route   GET /api/news/:id
// @access  Public
export const getNewsById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const news = await News.findById(req.params.id).populate('author', 'name');
        if (news) {
            res.status(200).json({ data: news });
        } else {
            res.status(404);
            throw new Error('Berita tidak ditemukan');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update a news article
// @route   PUT /api/news/:id
// @access  Private/Admin
export const updateNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, content, imageUrl } = req.body;
        const news = await News.findById(req.params.id);

        if (news) {
            news.title = title || news.title;
            news.content = content || news.content;
            news.imageUrl = imageUrl || news.imageUrl;

            const updatedNews = await news.save();
            res.status(200).json({ message: 'Berita berhasil diperbarui.', data: updatedNews });
        } else {
            res.status(404);
            throw new Error('Berita tidak ditemukan');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a news article
// @route   DELETE /api/news/:id
// @access  Private/Admin
export const deleteNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const news = await News.findById(req.params.id);

        if (news) {
            await news.deleteOne();
            res.status(200).json({ message: 'Berita berhasil dihapus.' });
        } else {
            res.status(404);
            throw new Error('Berita tidak ditemukan');
        }
    } catch (error) {
        next(error);
    }
};