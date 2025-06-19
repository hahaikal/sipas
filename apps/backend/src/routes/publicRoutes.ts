import { Router } from 'express';
import * as publicController from '../controllers/publicController';

const router = Router();

router.get('/news', publicController.getPublicNews);
router.get('/gallery', publicController.getPublicGallery);
router.get('/achievements', publicController.getPublicAchievements);

export default router;