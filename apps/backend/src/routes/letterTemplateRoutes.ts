import { Router } from 'express';
import * as templateController from '../controllers/letterTemplateController';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

const canManageTemplates = (req: any, res: any, next: any) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'kepala sekolah')) {
        next();
    } else {
        res.status(403);
        throw new Error('Akses ditolak. Hanya Admin atau Kepala Sekolah yang dapat mengelola templat.');
    }
};

router.route('/')
    .get(protect, canManageTemplates, templateController.getAllTemplates)
    .post(protect, canManageTemplates, templateController.createTemplate);

router.route('/:id')
    .get(protect, canManageTemplates, templateController.getTemplateById)
    .put(protect, canManageTemplates, templateController.updateTemplate)
    .delete(protect, canManageTemplates, templateController.deleteTemplate);

export default router;