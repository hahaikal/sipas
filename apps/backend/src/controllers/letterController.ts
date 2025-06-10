import { Request, Response, NextFunction } from 'express';
import Letter from '../models/Letter';

interface AuthenticatedRequest extends Request {
    user?: { id: string };
}

export const createLetter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { nomorSurat, judul, tanggalSurat, kategori, tipeSurat } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File surat (PDF) harus diunggah.' });
    }

    const newLetter = new Letter({
      nomorSurat,
      judul,
      tanggalSurat,
      kategori,
      tipeSurat,
      fileUrl: req.file.path,
      createdBy: req.user?.id,
    });

    await newLetter.save();
    res.status(201).json({ message: 'Surat berhasil diarsipkan.', data: newLetter });

  } catch (error) {
    next(error);
  }
};

export const getAllLetters = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const letters = await Letter.find().populate('createdBy', 'name email');
        res.status(200).json({ data: letters });
    } catch (error) {
        next(error);
    }
}