import { Request, Response, NextFunction } from 'express';
import Gallery from '../models/Gallery';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import fs from 'fs';
import path from 'path';

export const createGalleryItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { caption } = req.body;
        if (!req.file) {
            res.status(400).json({ message: 'File gambar harus diunggah.' });
            return;
        }

        const newItem = new Gallery({
            caption,
            imageUrl: '/' + req.file.path.replace(/\\/g, '/'),
            uploadedBy: req.user?.id,
        });

        const createdItem = await newItem.save();
        res.status(201).json({ message: 'Item galeri berhasil ditambahkan.', data: createdItem });
    } catch (error) {
        next(error);
    }
};

export const getAllGalleryItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await Gallery.find({}).sort({ createdAt: -1 });
        res.status(200).json({ data: items });
    } catch (error) {
        next(error);
    }
};


export const deleteGalleryItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const item = await Gallery.findById(req.params.id);

        if (!item) {
            res.status(404);
            throw new Error('Item galeri tidak ditemukan');
        }

        const imagePath = path.join(__dirname, '..', '..', item.imageUrl);

        await item.deleteOne();

        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) console.error(`Gagal menghapus file gambar: ${imagePath}`, err);
            });
        } else {
            console.warn(`File tidak ditemukan untuk dihapus: ${imagePath}`);
        }

        res.status(200).json({ message: 'Item galeri berhasil dihapus.' });
    } catch (error) {
        next(error);
    }
};