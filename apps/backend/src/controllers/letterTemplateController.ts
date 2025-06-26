import { Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';
import LetterTemplate from '../models/LetterTemplate';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'h1', 'h2', 'u', 's', 'p', 'br', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['style', 'class', 'align', 'width', 'height'],
    'a': ['href', 'name', 'target'],
    'img': ['src', 'srcset', 'alt', 'title', 'width', 'height', 'style']
  },
  allowedStyles: {
    '*': {
      'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
      'font-size': [/^\d+(?:px|em|%)$/],
      'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
      'font-weight': [/^bold$/, /^normal$/],
      'text-decoration': [/^underline$/, /^line-through$/],
      'font-style': [/^italic$/]
    }
  }
};

/**
 * @desc    Membuat template surat baru
 * @route   POST /api/templates
 * @access  Private (Admin, Kepala Sekolah)
 */
export const createTemplate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { name, description, body } = req.body;
        const schoolId = req.user?.schoolId;

        if (!name || !body) {
            res.status(400);
            throw new Error('Nama dan isi template (body) tidak boleh kosong.');
        }

        const sanitizedBody = sanitizeHtml(body, sanitizeOptions);

        const newTemplate = new LetterTemplate({
            name,
            description,
            body: sanitizedBody,
            schoolId,
        });
        const createdTemplate = await newTemplate.save();
        res.status(201).json({ message: 'Template berhasil dibuat.', data: createdTemplate });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mendapatkan semua template surat milik sekolah
 * @route   GET /api/templates
 * @access  Private (Admin, Kepala Sekolah)
 */
export const getAllTemplates = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const templates = await LetterTemplate.find({ schoolId }).sort({ createdAt: -1 });
        res.status(200).json({ data: templates });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mendapatkan detail satu template surat berdasarkan ID
 * @route   GET /api/templates/:id
 * @access  Private (Admin, Kepala Sekolah)
 */
export const getTemplateById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const template = await LetterTemplate.findOne({ _id: req.params.id, schoolId });

        if (!template) {
            res.status(404);
            throw new Error('Template tidak ditemukan.');
        }
        res.status(200).json({ data: template });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Memperbarui template surat
 * @route   PUT /api/templates/:id
 * @access  Private (Admin, Kepala Sekolah)
 */
export const updateTemplate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const { name, description, body } = req.body;

        const template = await LetterTemplate.findOne({ _id: req.params.id, schoolId });

        if (!template) {
            res.status(404);
            throw new Error('Template tidak ditemukan.');
        }

        template.name = name || template.name;
        template.description = description || template.description;
        
        if (body) {
            template.body = sanitizeHtml(body, sanitizeOptions);
        }

        const updatedTemplate = await template.save();
        res.status(200).json({ message: 'Template berhasil diperbarui.', data: updatedTemplate });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Menghapus template surat
 * @route   DELETE /api/templates/:id
 * @access  Private (Admin, Kepala Sekolah)
 */
export const deleteTemplate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schoolId = req.user?.schoolId;
        const template = await LetterTemplate.findOne({ _id: req.params.id, schoolId });

        if (!template) {
            res.status(404);
            throw new Error('Template tidak ditemukan.');
        }

        await template.deleteOne();
        res.status(200).json({ message: 'Template berhasil dihapus.' });
    } catch (error) {
        next(error);
    }
};