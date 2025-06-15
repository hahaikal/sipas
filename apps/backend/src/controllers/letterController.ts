import { Request, Response, NextFunction } from 'express';
import Letter from '../models/Letter';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { convertToDate } from '../utils/formatters';
import fs from 'fs';

export const createLetter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File surat (PDF) harus diunggah.' });
  }

  const filePath = req.file.path;
  const { nomorSurat, judul, kategori, tipeSurat } = req.body;
  
  try {
    const existingLetter = await Letter.findOne({ nomorSurat });
    if (existingLetter) {
      fs.unlinkSync(filePath);
      res.status(409);
      throw new Error(`Surat dengan nomor "${nomorSurat}" sudah ada.`);
    }

    const tanggalSurat = convertToDate(req.body.tanggalSurat);
    if (!tanggalSurat) {
        fs.unlinkSync(filePath);
        res.status(400);
        throw new Error('Format tanggal tidak valid. Harap gunakan format YYYY-MM-DD atau "DD NamaBulan YYYY".');
    }

    if (!nomorSurat || !judul || !kategori || !tipeSurat) {
        fs.unlinkSync(filePath);
        res.status(400);
        throw new Error('Data surat tidak lengkap: nomorSurat, judul, kategori, dan tipeSurat wajib diisi.');
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
    res.status(201).json({ message: 'Surat berhasil diarsipkan.', data: newLetter });

  } catch (error: any) {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Gagal menghapus file setelah error:", filePath, unlinkErr);
        });
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

export const createLetterFromBot = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File surat (PDF) harus diunggah.' });
  }

  const filePath = req.file.path;
  const { nomorSurat, judul, userPhone } = req.body;
  
  try {
    const user = await User.findOne({ phone: userPhone });
    if (!user) {
        fs.unlinkSync(filePath);
        res.status(404);
        throw new Error(`Pengguna dengan nomor telepon ${userPhone} tidak terdaftar di sistem.`);
    }

    const existingLetter = await Letter.findOne({ nomorSurat });
    if (existingLetter) {
      fs.unlinkSync(filePath);
      res.status(409);
      throw new Error(`Surat dengan nomor "${nomorSurat}" sudah ada.`);
    }
      
    const tanggalSurat = convertToDate(req.body.tanggalSurat);
    if (!tanggalSurat) {
      fs.unlinkSync(filePath);
      res.status(400);
      throw new Error('Gagal mengekstrak tanggal dari PDF atau formatnya tidak valid.');
    }
      
    const newLetter = new Letter({
      nomorSurat,
      judul,
      tanggalSurat,
      kategori: req.body.kategori || "Umum",
      tipeSurat: req.body.tipeSurat || "masuk",
      fileUrl: filePath,
      createdBy: user._id,
    });

    await newLetter.save();
    res.status(201).json({ message: 'Surat berhasil diarsipkan melalui Bot.', data: newLetter });
      
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Gagal menghapus file bot setelah error:", filePath, err);
      });
    }
    next(error);
  }
};