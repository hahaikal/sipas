import { Router } from 'express';
import { getPlaceholders } from '../controllers/placeholderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getPlaceholders);

export default router;