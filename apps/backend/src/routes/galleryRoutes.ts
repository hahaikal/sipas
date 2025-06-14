import { Router } from 'express';
import * as galleryController from '../controllers/galleryController';
import { uploadImage } from '../middleware/uploadMiddleware';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', galleryController.getAllGalleryItems);

router.post('/', protect, admin, uploadImage.single('image'), galleryController.createGalleryItem);
router.delete('/:id', protect, admin, galleryController.deleteGalleryItem);

export default router;