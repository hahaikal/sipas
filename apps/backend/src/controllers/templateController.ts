import { Response, NextFunction } from 'express';
import LetterTemplate from '../models/LetterTemplate';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from 'express-async-handler';

export const createTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, description, body, requiredInputs } = req.body;
    const schoolId = req.user?.schoolId;

    const template = new LetterTemplate({
        name,
        description,
        body,
        requiredInputs,
        schoolId,
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
    const { name, description, body, requiredInputs } = req.body;
    const template = await LetterTemplate.findOne({ _id: req.params.id, schoolId: req.user?.schoolId });

    if (template) {
        template.name = name || template.name;
        template.description = description || template.description;
        template.body = body || template.body;
        template.requiredInputs = requiredInputs || template.requiredInputs;

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