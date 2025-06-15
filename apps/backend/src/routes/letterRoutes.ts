import { Router } from 'express';
import * as letterController from '../controllers/letterController';
import { upload } from '../middleware/uploadMiddleware';
import { protect } from '../middleware/authMiddleware';
import { verifyApiKey } from '../middleware/apiKeyMiddleware';

const router = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post('/bot-upload', verifyApiKey, upload.single('file'), asyncHandler(letterController.createLetterFromBot));

router.route('/')
  .post(protect, upload.single('file'), asyncHandler(letterController.createLetter))
  .get(protect, letterController.getAllLetters);

router.route('/:id')
  .all(protect)
  .get(letterController.getLetterById)
  .put(letterController.updateLetter)
  .delete(letterController.deleteLetter);

router.get('/by-nomor/:nomor', protect, letterController.getLetterByNumber);

export default router;