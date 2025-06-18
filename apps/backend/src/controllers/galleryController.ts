import { Request, Response, NextFunction } from 'express';
import Gallery from '../models/Gallery';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { storageService } from '../services/storageService';

export const createGalleryItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { caption } = req.body;
        if (!req.file) {
            res.status(400).json({ message: 'File gambar harus diunggah.' });
            return;
        }
        const schoolId = req.user?.schoolId;

        const publicId = await storageService.upload(req.file, 'cloudinary');

        const newItem = new Gallery({
            caption,
            imageUrl: publicId,
            uploadedBy: req.user?.id,
            schoolId,
        });

        const createdItem = await newItem.save();
        res.status(201).json({ message: 'Item galeri berhasil ditambahkan.', data: createdItem });
    } catch (error) {
        next(error);
    }
};

export const getAllGalleryItems = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const items = await Gallery.find({ schoolId }).sort({ createdAt: -1 });
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

export const deleteGalleryItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const item = await Gallery.findOne({ _id: req.params.id, schoolId });

        if (!item) {
            res.status(404);
            throw new Error('Item galeri tidak ditemukan');
        }

        await storageService.delete(item.imageUrl, 'cloudinary');

        await item.deleteOne();

        res.status(200).json({ message: 'Item galeri berhasil dihapus.' });
    } catch (error) {
        next(error);
    }
};
