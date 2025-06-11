import { Router } from 'express';
import * as letterController from '../controllers/letterController';
import { upload } from '../middleware/uploadMiddleware';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.route('/')
  .post(upload.single('file'), asyncHandler(letterController.createLetter))
  .get(letterController.getAllLetters);

router.route('/:id')
  .get(letterController.getLetterById)
  .put(letterController.updateLetter)
  .delete(letterController.deleteLetter);

export default router;