import { Request, Response, NextFunction } from 'express';
import Letter from '../models/Letter';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { convertToDate } from '../utils/formatters';
import { storageService } from '../services/storageService';

export const createLetter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File surat (PDF) harus diunggah.' });
  }

  const { nomorSurat, judul, kategori, tipeSurat } = req.body;
  
  try {
    const existingLetter = await Letter.findOne({ nomorSurat });
    if (existingLetter) {
      await storageService.delete(req.file.filename, 'b2');
      res.status(409);
      throw new Error(`Surat dengan nomor "${nomorSurat}" sudah ada.`);
    }

    const tanggalSurat = convertToDate(req.body.tanggalSurat);
    if (!tanggalSurat || !nomorSurat || !judul || !kategori || !tipeSurat) {
      await storageService.delete(req.file.filename, 'b2');
      res.status(400);
      throw new Error('Data surat tidak lengkap atau format tanggal tidak valid');
    }

    const fileIdentifier = await storageService.upload(req.file, 'b2');
    const newLetter = new Letter({
      nomorSurat,
      judul,
      tanggalSurat,
      kategori,
      tipeSurat,
      fileUrl: fileIdentifier,
      createdBy: req.user?.id,
    });

    await newLetter.save();
    res.status(201).json({ message: 'Surat berhasil diarsipkan.', data: newLetter });

  } catch (error: any) {
    try {
      await storageService.delete(req.file.filename, 'b2');
    } catch (delErr) {
      console.error("Gagal menghapus file setelah error:", req.file.filename, delErr);
    }
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

        const fileIdentifier = letter.fileUrl;

        await storageService.delete(fileIdentifier, 'b2');

        await letter.deleteOne();

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

export const createLetterFromBot = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File surat (PDF) harus diunggah.' });
  }

  const { nomorSurat, judul, userPhone } = req.body;
  
  try {
    const user = await User.findOne({ phone: userPhone });
    if (!user) {
        await storageService.delete(req.file.filename, 'b2');
        res.status(404);
        throw new Error(`Pengguna dengan nomor telepon ${userPhone} tidak terdaftar di sistem.`);
    }

    const existingLetter = await Letter.findOne({ nomorSurat });
    if (existingLetter) {
      await storageService.delete(req.file.filename, 'b2');
      res.status(409);
      throw new Error(`Surat dengan nomor "${nomorSurat}" sudah ada.`);
    }
      
    const tanggalSurat = convertToDate(req.body.tanggalSurat);
    if (!tanggalSurat) {
      await storageService.delete(req.file.filename, 'b2');
      res.status(400);
      throw new Error('Gagal mengekstrak tanggal dari PDF atau formatnya tidak valid.');
    }
      
    const fileIdentifier = await storageService.upload(req.file, 'b2');

    const newLetter = new Letter({
      nomorSurat,
      judul,
      tanggalSurat,
      kategori: req.body.kategori || "Umum",
      tipeSurat: req.body.tipeSurat || "masuk",
      fileUrl: fileIdentifier,
      createdBy: user._id,
    });

    await newLetter.save();
    res.status(201).json({ message: 'Surat berhasil diarsipkan melalui Bot.', data: newLetter });
      
  } catch (error) {
    try {
      await storageService.delete(req.file.filename, 'b2');
    } catch (delErr) {
      console.error("Gagal menghapus file bot setelah error:", req.file.filename, delErr);
    }
    next(error);
  }
};
