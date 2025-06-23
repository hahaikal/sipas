import { Router } from 'express';
import * as templateController from '../controllers/templateController';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

router.route('/')
  .get(protect, templateController.getAllTemplates)
  .post(protect, admin, templateController.createTemplate);

router.route('/:id')
  .get(protect, templateController.getTemplateById)
  .put(protect, admin, templateController.updateTemplate)
  .delete(protect, admin, templateController.deleteTemplate);

export default router;