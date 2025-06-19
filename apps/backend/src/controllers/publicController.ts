import { Request, Response, NextFunction } from 'express';
import School from '../models/School';
import News from '../models/News';
import Gallery from '../models/Gallery';
import Achievement from '../models/Achievement';
import { storageService } from '../services/storageService';

const getSchoolIdFromSubdomain = async (subdomain: any) => {
    if (!subdomain || typeof subdomain !== 'string') {
        const err: any = new Error('Query parameter "subdomain" is required.');
        err.statusCode = 400;
        throw err;
    }

    const school = await School.findOne({ subdomain: subdomain, status: 'active' });
    if (!school) {
        const err: any = new Error(`School with subdomain "${subdomain}" not found or is not active.`);
        err.statusCode = 404;
        throw err;
    }
    return school._id;
};

export const getPublicNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schoolId = await getSchoolIdFromSubdomain(req.query.subdomain);
        const news = await News.find({ schoolId })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('author', 'name');
        res.status(200).json({ data: news });
    } catch (error) {
        next(error);
    }
};

export const getPublicGallery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schoolId = await getSchoolIdFromSubdomain(req.query.subdomain);
        const items = await Gallery.find({ schoolId })
            .sort({ createdAt: -1 })
            .limit(6);
            
        const itemsWithUrls = await Promise.all(items.map(async (item) => {
            const imageUrl = await storageService.getAccessUrl(item.imageUrl, 'cloudinary');
            return {
                ...item.toObject(),
                imageUrl,
            };
        }));

        res.status(200).json({ data: itemsWithUrls });
    } catch (error) {
        next(error);
    }
};

export const getPublicAchievements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schoolId = await getSchoolIdFromSubdomain(req.query.subdomain);
        const achievements = await Achievement.find({ schoolId })
            .sort({ year: -1, createdAt: -1 })
            .limit(4);
        res.status(200).json({ data: achievements });
    } catch (error) {
        next(error);
    }
};