import { Request, Response, NextFunction } from 'express';
import Letter from '../models/Letter';
import User from '../models/User';
import School from '../models/School';
import { AuthenticatedRequest, getSchoolIdFromSubdomain } from '../middleware/authMiddleware';
import { convertToDate } from '../utils/formatters';
import { storageService } from '../services/storageService';

export const createLetter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File surat (PDF) harus diunggah.' });
  }

  try {
    const schoolId = await getSchoolIdFromSubdomain(req);
    const { nomorSurat, judul, kategori, tipeSurat } = req.body;

    const existingLetter = await Letter.findOne({ nomorSurat, schoolId: schoolId });
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
    const fileUrlObj = JSON.parse(fileIdentifier);

    const newLetter = new Letter({
      nomorSurat,
      judul,
      tanggalSurat,
      kategori,
      tipeSurat,
      fileUrl: fileIdentifier,
      createdBy: req.user?.id,
      schoolId: schoolId,
    });

    await newLetter.save();
    res.status(201).json({ message: 'Surat berhasil diarsipkan.', data: newLetter });

  } catch (error: any) {
    try {
      // Do not delete if fileIdentifier is not available
      // req.file.filename is local temp file, not B2 file identifier
      // So deletion on B2 is not possible here
    } catch (delErr) {
      console.error("Gagal menghapus file setelah error:", req.file.filename, delErr);
    }
    next(error);
  }
};

export const getAllLetters = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = await getSchoolIdFromSubdomain(req);
        const { status } = req.body;

        const filter: { schoolId: any; status?: string } = { schoolId: schoolId };
        if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            filter.status = status;
        }

        const letters = await Letter.find(filter).populate('createdBy', 'name email');
        res.status(200).json({ data: letters });
    } catch (error) {
        next(error);
    }
}

export const getLetterById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = await getSchoolIdFromSubdomain(req);
        const letter = await Letter.findOne({ _id: req.params.id, schoolId: schoolId }).populate('createdBy', 'name email');
        if (!letter) {
            res.status(404);
            throw new Error('Surat tidak ditemukan');
        }
        res.status(200).json({ data: letter });
    } catch (error) {
        next(error);
    }
};

export const updateLetter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = await getSchoolIdFromSubdomain(req);
        const letter = await Letter.findOne({ _id: req.params.id, schoolId: schoolId });

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

export const deleteLetter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = await getSchoolIdFromSubdomain(req);
        const letter = await Letter.findOne({ _id: req.params.id, schoolId: schoolId });

        if (!letter) {
            res.status(404);
            throw new Error('Surat tidak ditemukan');
        }

        const fileIdentifier = letter.fileUrl;
        let fileId = '';
        let fileName = '';
        try {
          const parsed = JSON.parse(fileIdentifier);
          fileId = parsed.fileId;
          fileName = parsed.fileName;
        } catch (e) {
          console.error('Failed to parse fileIdentifier in deleteLetter:', fileIdentifier);
          throw new Error('Invalid file identifier format.');
        }

        await storageService.delete(fileIdentifier, 'b2', fileName);
        await letter.deleteOne();

        res.status(200).json({ message: 'Surat berhasil dihapus.' });
    } catch (error) {
        next(error);
    }
};

export const getLetterByNumber = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
    const fileUrlObj = JSON.parse(fileIdentifier);

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
      // Do not delete if fileIdentifier is not available
      // req.file.filename is local temp file, not B2 file identifier
      // So deletion on B2 is not possible here
    } catch (delErr) {
      console.error("Gagal menghapus file bot setelah error:", req.file.filename, delErr);
    }
    next(error);
  }
};

export const getLetterViewUrl = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subdomain = req.body.subdomain;
    if (!subdomain) {
      res.status(400);
      throw new Error('Subdomain tidak ditemukan di request body');
    }

    const school = await School.findOne({ subdomain: subdomain, status: 'active' });
    if (!school) {
      res.status(404);
      throw new Error(`Sekolah dengan subdomain "${subdomain}" tidak ditemukan atau tidak aktif`);
    }
    
    const letter = await Letter.findOne({ _id: req.params.id, schoolId: school._id });
    if (!letter) {
      res.status(404);
      throw new Error('Surat tidak ditemukan');
    }

    const fileIdentifier = letter.fileUrl;
    let fileId = '';
    let fileName = '';
    try {
      const parsed = JSON.parse(fileIdentifier);
      fileId = parsed.fileId;
      fileName = parsed.fileName;
    } catch (e) {
      console.error('Failed to parse fileIdentifier in getLetterViewUrl:', fileIdentifier);
      throw new Error('Invalid file identifier format.');
    }

    const downloadUrl = await storageService.getAccessUrl(fileName, 'b2');

    res.status(200).json({ url: downloadUrl });
  } catch (error) {
    next(error);
  }
};

export const approveLetter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const letter = await Letter.findOne({ _id: req.params.id, schoolId });

        if (!letter) {
            res.status(404);
            throw new Error('Surat tidak ditemukan');
        }

        if (letter.status !== 'PENDING') {
            res.status(400);
            throw new Error(`Surat dengan status ${letter.status} tidak dapat disetujui.`);
        }

        letter.status = 'APPROVED';
        letter.rejectionReason = undefined;
        await letter.save();

        res.status(200).json({ message: 'Surat berhasil disetujui.', data: letter });
    } catch (error) {
        next(error);
    }
};

export const rejectLetter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const { reason } = req.body;

        if (!reason) {
            res.status(400);
            throw new Error('Alasan penolakan wajib diisi.');
        }

        const letter = await Letter.findOne({ _id: req.params.id, schoolId });

        if (!letter) {
            res.status(404);
            throw new Error('Surat tidak ditemukan');
        }

        if (letter.status !== 'PENDING') {
            res.status(400);
            throw new Error(`Surat dengan status ${letter.status} tidak dapat ditolak.`);
        }

        letter.status = 'REJECTED';
        letter.rejectionReason = reason;
        await letter.save();

        res.status(200).json({ message: 'Surat berhasil ditolak.', data: letter });
    } catch (error) {
        next(error);
    }
};
