import { Router } from 'express';
import * as letterController from '../controllers/letterController';
import { upload } from '../middleware/uploadMiddleware';
import { protect, isApprover, requireAdminOrKepsek } from '../middleware/authMiddleware';
import { verifyApiKey } from '../middleware/apiKeyMiddleware';

const router = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.get('/dashboard/stats', protect, asyncHandler(letterController.getDashboardStats));

router.patch('/:id/approve', protect, isApprover, letterController.approveLetter);
router.patch('/:id/reject', protect, isApprover, letterController.rejectLetter);

router.post('/bot-upload', verifyApiKey, upload.single('file'), asyncHandler(letterController.createLetterFromBot));

router.route('/')
  .post(protect, upload.single('file'), asyncHandler(letterController.createLetter));

router.route('/list')
  .post(protect, requireAdminOrKepsek, asyncHandler(letterController.getAllLetters));

router.route('/:id')
  .all(protect, requireAdminOrKepsek)
  .post(letterController.getLetterById)
  .put(letterController.updateLetter)
  .delete(letterController.deleteLetter);

router.post('/:id/view', protect, letterController.getLetterViewUrl);

router.get('/by-nomor/:nomor', protect, letterController.getLetterByNumber);

export default router;
