import { Request, Response, NextFunction } from 'express';
import Letter from '../models/Letter';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { convertToDate } from '../utils/pdfExtractor';
import fs from 'fs';

export const createLetter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File surat (PDF) harus diunggah.' });
  }

  const filePath = req.file.path;

  try {
    const kategori = req.body.kategori || "Umum";
    const tipeSurat = req.body.tipeSurat || "keluar";
    const nomorSurat = req.body.nomorSurat;
    const judul = req.body.judul;
    const tanggalSurat = convertToDate(req.body.tanggalSurat);

    if (!nomorSurat || !judul || !tanggalSurat || !kategori || !tipeSurat) {
        throw new Error(`Data surat tidak lengkap. nomorSurat: ${nomorSurat}, judul: ${judul}, tanggalSurat: ${tanggalSurat}, kategori: ${kategori}, tipeSurat: ${tipeSurat}`);
    }

    const newLetter = new Letter({
      nomorSurat,
      judul,
      tanggalSurat,
      kategori,
      tipeSurat,
      fileUrl: filePath,
      createdBy: req.user?.id,
    });

    await newLetter.save();
    res.status(201).json({ message: 'Surat berhasil diarsipkan dengan ekstraksi data.', data: newLetter });

  } catch (error: any) {
    console.error("Error during letter creation:", error.message);
    fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
            console.error("Failed to delete orphaned file:", filePath, unlinkErr);
        }
    });

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

export const getLetterById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const letter = await Letter.findById(req.params.id).populate('createdBy', 'name email');
        if (!letter) {
            res.status(404);
            throw new Error('Surat tidak ditemukan');
        }
        res.status(200).json({ data: letter });
    } catch (error) {
        next(error);
    }
};

export const updateLetter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const letter = await Letter.findById(req.params.id);

        if (!letter) {
            res.status(404);
            throw new Error('Surat tidak ditemukan');
        }
        
        const updatedLetter = await Letter.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ message: 'Surat berhasil diperbarui.', data: updatedLetter });
    } catch (error) {
        next(error);
    }
};

export const deleteLetter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const letter = await Letter.findById(req.params.id);

        if (!letter) {
            res.status(404);
            throw new Error('Surat tidak ditemukan');
        }

        const filePath = letter.fileUrl;

        await letter.deleteOne();

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Gagal menghapus file: ${filePath}`, err);
            }
        });

        res.status(200).json({ message: 'Surat berhasil dihapus.' });
    } catch (error) {
        next(error);
    }
};

export const getLetterByNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const letter = await Letter.findOne({ nomorSurat: req.params.nomor }).populate('createdBy', 'name');
        if (!letter) {
            res.status(404);
            throw new Error('Surat dengan nomor tersebut tidak ditemukan');
        }
        res.status(200).json({ data: letter });
    } catch (error) {
        next(error);
    }
};