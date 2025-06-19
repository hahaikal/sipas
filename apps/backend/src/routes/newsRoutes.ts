import { Router } from 'express';
import * as newsController from '../controllers/newsController';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

router.route('/')
    .get(protect, admin, newsController.getAllNews);

router.route('/:id')
    .get(protect, admin, newsController.getNewsById);

router.route('/')
    .post(protect, admin, newsController.createNews);

router.route('/:id')
    .put(protect, admin, newsController.updateNews)
    .delete(protect, admin, newsController.deleteNews);

export default router;