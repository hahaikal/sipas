import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import Letter from '../models/Letter';
import User from '../models/User';
import School from '../models/School';
import Disposition from '../models/Disposition';
import { AuthenticatedRequest, getSchoolIdFromSubdomain } from '../middleware/authMiddleware';
import { convertToDate } from '../utils/formatters';
import { storageService } from '../services/storageService';
import LetterTemplate from '../models/LetterTemplate';
import Sequence from '../models/Sequence';
import PDFDocument from 'pdfkit';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

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
    if (!fileIdentifier) {
      throw new Error('File identifier is missing');
    }
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
          if (!fileIdentifier) {
            throw new Error('File identifier is missing');
          }
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

    if (!letter.fileUrl) {
        res.status(404);
        throw new Error('Dokumen final belum tersedia untuk surat ini.');
    }

    const fileIdentifier = letter.fileUrl;
    let fileName = '';
    try {
      const parsed = JSON.parse(fileIdentifier);
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

/**
 * @desc    Menyetujui surat, men-generate PDF dari template, dan menyimpan hasilnya.
 * @route   POST /api/letters/:id/approve
 * @access  Private (Kepala Sekolah, Admin)
 */
export const generateAndApproveLetter = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const letterId = req.params.id;
    const approver = req.user;

    let fileIdentifier: string | null = null;

    try {
        const letter = await Letter.findById(letterId).populate('createdBy');
        if (!letter) {
            res.status(404);
            throw new Error('Surat yang akan disetujui tidak ditemukan.');
        }
        
        if (!letter.templateId) {
             res.status(400);
             throw new Error('Surat ini tidak terhubung dengan template manapun.');
        }

        const template = await LetterTemplate.findById(letter.templateId);
        if (!template) {
            res.status(404);
            throw new Error('Template untuk surat ini tidak ditemukan.');
        }

        const school = await School.findById(letter.schoolId);
        if (!school || !school.letterheadDetail || !school.logoUrl) {
            res.status(404);
            throw new Error('Data kop surat atau logo sekolah belum diatur.');
        }
        
        const dynamicData = letter.formData ? JSON.parse(letter.formData) : {};
        const fullData = {
            ...dynamicData,
            kop_surat: school.letterheadDetail,
            logo_url: await storageService.getAccessUrl(school.logoUrl, 'cloudinary'),
            penyetuju: {
                nama: approver?.name,
                jabatan: approver?.role
            },
            tanggal_persetujuan: new Date().toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
            }),
        };

        const compileTemplate = handlebars.compile(template.body);
        const finalHtml = compileTemplate(fullData);

        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        const mockFile = {
            buffer: pdfBuffer,
            originalname: `surat-${letter.nomorSurat.replace(/\//g, '_')}.pdf`,
            mimetype: 'application/pdf',
            size: pdfBuffer.length
        };
        
        fileIdentifier = await storageService.upload(mockFile as Express.Multer.File, 'b2');

        letter.fileUrl = fileIdentifier;
        letter.status = 'APPROVED';
        letter.approvedBy = approver?._id as mongoose.Types.ObjectId | undefined;
        letter.approvedAt = new Date();
        
        const updatedLetter = await letter.save();

        res.status(200).json({
            message: 'Surat berhasil disetujui dan PDF telah dibuat.',
            data: updatedLetter
        });

    } catch (error) {
        if (fileIdentifier) {
            try {
                const parsedIdentifier = JSON.parse(fileIdentifier);
                await storageService.delete(fileIdentifier, 'b2', parsedIdentifier.fileName);
            } catch (cleanupError) {
                console.error('KRITIKAL: Gagal membersihkan file yatim.', cleanupError);
            }
        }
        next(error);
    }
});

export const rejectLetter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const letter = await Letter.findOne({ _id: req.params.id, schoolId: req.user?.schoolId });

        if (!letter) {
            res.status(404);
            throw new Error('Pengajuan surat tidak ditemukan');
        }
        if (letter.status !== 'PENDING') {
            res.status(400);
            throw new Error(`Hanya surat dengan status PENDING yang bisa ditolak.`);
        }

        letter.status = 'REJECTED';
        letter.approvedBy = req.user?.id;
        await letter.save();

        res.status(200).json({ message: 'Pengajuan surat telah ditolak.', data: letter });
    } catch (error) {
        next(error);
    }
};


export const getDashboardStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) {
            res.status(400);
            throw new Error('School ID tidak ditemukan');
        }

        const suratMasuk = await Letter.countDocuments({ schoolId, tipeSurat: 'masuk' });
        const suratKeluar = await Letter.countDocuments({ schoolId, tipeSurat: 'keluar' });
        const pendaftarPpdb = 0;

        res.status(200).json({ suratMasuk, suratKeluar, pendaftarPpdb });
    } catch (error) {
        next(error);
    }
};

const getNextSequenceValue = async (schoolId: string, year: number) => {
    const sequenceName = `letter-${schoolId}-${year}`;
    const sequence = await Sequence.findByIdAndUpdate(
        sequenceName,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return sequence.seq;
};

export const createLetterRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { templateId, formData } = req.body;
        const schoolId = req.user?.schoolId;

        if (!templateId || !formData) {
            res.status(400);
            throw new Error("Template ID dan data form harus diisi.");
        }

        const template = await LetterTemplate.findOne({ _id: templateId, schoolId });
        if (!template) {
            res.status(404);
            throw new Error("Template surat tidak ditemukan.");
        }

        let generatedContent = template.body;
        for (const key in formData) {
            const placeholder = new RegExp(`{${key}}`, 'g');
            generatedContent = generatedContent.replace(placeholder, formData[key]);
        }

        const currentYear = new Date().getFullYear();
        const sequenceNumber = await getNextSequenceValue(schoolId!.toString(), currentYear);
        const formattedNomorSurat = `${sequenceNumber.toString().padStart(3, '0')}/SK/SIPAS/${currentYear}`;

        const newLetter = new Letter({
            nomorSurat: formattedNomorSurat,
            judul: template.name,
            tipeSurat: 'generated',
            content: generatedContent,
            status: 'PENDING',
            formData: formData,
            template: templateId,
            createdBy: req.user?.id,
            schoolId,
        });

        const createdLetter = await newLetter.save();
        res.status(201).json({ message: 'Pengajuan surat berhasil dibuat.', data: createdLetter });

    } catch (error) {
        next(error);
    }
};

export const getLetterPreview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const letter = await Letter.findOne({ _id: req.params.id, schoolId: req.user?.schoolId });

        if (!letter) {
            res.status(404);
            throw new Error('Surat tidak ditemukan.');
        }

        res.status(200).json({ content: letter.content || 'Konten tidak tersedia.' });

    } catch (error) {
        next(error);
    }
};

export const createDisposition = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { toUser, instructions } = req.body;
    const { id: letterId } = req.params;

    if (!toUser || !instructions) {
        res.status(400);
        throw new Error('Penerima dan instruksi harus diisi.');
    }

    const disposition = new Disposition({
        letterId,
        fromUser: req.user?.id,
        toUser,
        instructions,
        schoolId: req.user?.schoolId,
    });

    const createdDisposition = await disposition.save();
    res.status(201).json({ message: 'Disposisi berhasil dikirim.', data: createdDisposition });
});

export const getDispositionsForLetter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id: letterId } = req.params;

    const dispositions = await Disposition.find({ letterId })
        .populate('fromUser', 'name role')
        .populate('toUser', 'name role')
        .sort({ createdAt: 'asc' });

    res.status(200).json({ data: dispositions });
});