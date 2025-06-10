import { Router } from 'express';
import * as letterController from '../controllers/letterController';
import { upload } from '../middleware/uploadMiddleware';
import { protect } from '../middleware/authMiddleware';

const router = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.route('/')
  .post(protect, upload.single('file'), asyncHandler(letterController.createLetter))
  .get(protect, asyncHandler(letterController.getAllLetters));

export default router;