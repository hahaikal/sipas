import { Router } from 'express';
import * as dispositionController from '../controllers/dispositionController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/forme', protect, dispositionController.getMyDispositions);

export default router;