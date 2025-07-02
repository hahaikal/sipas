import { Response } from 'express';
import LetterTemplate from '../models/LetterTemplate';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from 'express-async-handler';
import sanitizeHtml from 'sanitize-html';

const sanitizeOptions = {
    allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li',
        'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead',
        'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'
    ],
    allowedAttributes: {
        a: ['href', 'name', 'target'],
        img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'style'],
        div: ['style'],
        span: ['style'],
        p: ['style'],
        td: ['style', 'colspan', 'rowspan'],
        th: ['style', 'colspan', 'rowspan']
    },
    allowedStyles: {
      '*': {
        'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
        'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
        'font-size': [/^\d+(?:px|em|%)$/]
      }
    }
};

export const createTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, description, body, placeholders, requiredInputs } = req.body;

    const sanitizedBody = sanitizeHtml(body, sanitizeOptions);

    const template = new LetterTemplate({
        name,
        description,
        body: sanitizedBody,
        placeholders,
        schoolId: req.user?.schoolId,
        requiredInputs,
    });

    const createdTemplate = await template.save();
    res.status(201).json({ message: 'Template berhasil dibuat.', data: createdTemplate });
});

export const getAllTemplates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const templates = await LetterTemplate.find({ schoolId: req.user?.schoolId });
    res.status(200).json({ data: templates });
});

export const getTemplateById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const template = await LetterTemplate.findOne({ _id: req.params.id, schoolId: req.user?.schoolId });
    if (template) {
        res.status(200).json({ data: template });
    } else {
        res.status(404);
        throw new Error('Template tidak ditemukan');
    }
});

export const updateTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, description, body, placeholders, requiredInputs } = req.body;
    const template = await LetterTemplate.findOne({ _id: req.params.id, schoolId: req.user?.schoolId });

    if (template) {
        template.name = name || template.name;
        template.description = description || template.description;
        template.placeholders = placeholders || template.placeholders;
        template.requiredInputs = requiredInputs || template.requiredInputs;

        if (body) {
            template.body = sanitizeHtml(body, sanitizeOptions);
        }

        const updatedTemplate = await template.save();
        res.status(200).json({ message: 'Template berhasil diperbarui.', data: updatedTemplate });
    } else {
        res.status(404);
        throw new Error('Template tidak ditemukan');
    }
});

export const deleteTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const template = await LetterTemplate.findOne({ _id: req.params.id, schoolId: req.user?.schoolId });

    if (template) {
        await template.deleteOne();
        res.status(200).json({ message: 'Template berhasil dihapus.' });
    } else {
        res.status(404);
        throw new Error('Template tidak ditemukan');
    }
});