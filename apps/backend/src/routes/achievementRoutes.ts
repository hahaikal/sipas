import { Router } from 'express';
import * as achievementController from '../controllers/achievementController';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, admin, achievementController.getAllAchievements);

router.post('/', protect, admin, achievementController.createAchievement);
router.delete('/:id', protect, admin, achievementController.deleteAchievement);

export default router;