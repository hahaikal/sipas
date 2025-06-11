import { Request, Response, NextFunction } from 'express';
import Letter from '../models/Letter';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { extractDataFromPdf } from '../utils/pdfExtractor';
import fs from 'fs';

export const createLetter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File surat (PDF) harus diunggah.' });
  }

  const filePath = req.file.path;

  try {
    const extractedData = await extractDataFromPdf(filePath);

    const { kategori, tipeSurat } = req.body;
    const nomorSurat = req.body.nomorSurat || extractedData.nomorSurat;
    const judul = req.body.judul || extractedData.judul;
    const tanggalSurat = req.body.tanggalSurat || extractedData.tanggalSurat;

    if (!nomorSurat || !judul || !tanggalSurat || !kategori || !tipeSurat) {
        throw new Error('Data surat tidak lengkap.');
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

        // Di sini kita akan tambahkan logika otorisasi,
        // misalnya, hanya admin yang bisa menghapus.
        // Juga, kita perlu menghapus file fisiknya dari server.
        // fs.unlinkSync(letter.fileUrl); // Contoh (perlu penanganan error)

        await letter.deleteOne();

        res.status(200).json({ message: 'Surat berhasil dihapus.' });
    } catch (error) {
        next(error);
    }
};