import { Router } from 'express';
import * as letterController from '../controllers/letterController';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.route('/')
  .post(upload.single('file'), asyncHandler(letterController.createLetter))
  .get(asyncHandler(letterController.getAllLetters));

export default router;