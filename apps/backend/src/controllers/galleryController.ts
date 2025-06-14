import { Request, Response, NextFunction } from 'express';
import Gallery from '../models/Gallery';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import fs from 'fs';

// @desc    Upload a new gallery item
// @route   POST /api/gallery
// @access  Private/Admin
export const createGalleryItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { caption } = req.body;
        if (!req.file) {
            res.status(400).json({ message: 'File gambar harus diunggah.' });
            return;
        }

        const newItem = new Gallery({
            caption,
            imageUrl: req.file.path,
            uploadedBy: req.user?.id,
        });

        const createdItem = await newItem.save();
        res.status(201).json({ message: 'Item galeri berhasil ditambahkan.', data: createdItem });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
export const getAllGalleryItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await Gallery.find({}).sort({ createdAt: -1 });
        res.status(200).json({ data: items });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
export const deleteGalleryItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const item = await Gallery.findById(req.params.id);

        if (!item) {
            res.status(404);
            throw new Error('Item galeri tidak ditemukan');
        }

        const imagePath = item.imageUrl;
        await item.deleteOne();

        fs.unlink(imagePath, (err) => {
            if (err) console.error(`Gagal menghapus file gambar: ${imagePath}`, err);
        });

        res.status(200).json({ message: 'Item galeri berhasil dihapus.' });
    } catch (error) {
        next(error);
    }
};