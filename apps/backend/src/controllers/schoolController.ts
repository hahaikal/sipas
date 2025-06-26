import { Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import School from '../models/School';
import { storageService } from '../services/storageService';

export const uploadLogo = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.file) {
        res.status(400);
        throw new Error('File gambar harus diunggah.');
    }
    const publicId = await storageService.upload(req.file, 'cloudinary');
    const imageUrl = await storageService.getAccessUrl(publicId, 'cloudinary');
    
    res.status(200).json({
        message: 'Logo berhasil diunggah.',
        url: imageUrl,
        publicId: publicId
    });
});

export const updateSchoolSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { logoUrl, letterheadDetail } = req.body;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
        res.status(400);
        throw new Error('School ID tidak ditemukan pada user.');
    }

    const school = await School.findById(schoolId);

    if (!school) {
        res.status(404);
        throw new Error('Sekolah tidak ditemukan.');
    }

    if (logoUrl !== undefined) {
        school.logoUrl = logoUrl;
    }
    if (letterheadDetail !== undefined) {
        school.letterheadDetail = letterheadDetail;
    }

    const updatedSchool = await school.save();
    res.status(200).json({ message: 'Pengaturan sekolah berhasil diperbarui.', data: updatedSchool });
});