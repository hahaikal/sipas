import { Router } from 'express';
import * as templateController from '../controllers/templateController';
import { protect, requireAdminOrKepsek } from '../middleware/authMiddleware';

const router = Router();

router.use(protect, requireAdminOrKepsek);

router.route('/')
  .get(templateController.getAllTemplates)
  .post(templateController.createTemplate);

router.route('/:id')
  .get(templateController.getTemplateById)
  .put(templateController.updateTemplate)
  .delete(templateController.deleteTemplate);

export default router;