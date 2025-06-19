import { Router } from 'express';
import * as galleryController from '../controllers/galleryController';
import { uploadImage } from '../middleware/uploadMiddleware';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', protect, admin, galleryController.getAllGalleryItems);

router.post('/', protect, admin, uploadImage.single('image'), asyncHandler(galleryController.createGalleryItem));
router.delete('/:id', protect, admin, asyncHandler(galleryController.deleteGalleryItem));

export default router;