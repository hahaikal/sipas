import { Router } from 'express';
import * as letterController from '../controllers/letterController';
import { upload } from '../middleware/uploadMiddleware';
import { protect, admin, isApprover } from '../middleware/authMiddleware';
import { verifyApiKey } from '../middleware/apiKeyMiddleware';

const router = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post('/bot-upload', verifyApiKey, upload.single('file'), asyncHandler(letterController.createLetterFromBot));

router.get('/dashboard/stats', protect, asyncHandler(letterController.getDashboardStats));

router.post('/generate-request', protect, asyncHandler(letterController.generateLetterRequest));

router.route('/')
  .post(protect, upload.single('file'), asyncHandler(letterController.createLetter));

router.route('/list')
  .post(protect, asyncHandler(letterController.getAllLetters));

router.route('/:id')
  .all(protect)
  .post(letterController.getLetterById)
  .put(letterController.updateLetter)
  .delete(letterController.deleteLetter);

router.route('/:id/dispositions')
  .post(protect, asyncHandler(letterController.createDisposition))
  .get(protect, asyncHandler(letterController.getDispositionsForLetter));

router.patch('/:id/approve', protect, isApprover, asyncHandler(letterController.generateAndApproveLetter));
router.patch('/:id/reject', protect, isApprover, asyncHandler(letterController.rejectLetter));
router.get('/:id/preview', protect, asyncHandler(letterController.getLetterPreview));
router.post('/:id/view', protect, letterController.getLetterViewUrl);

router.get('/by-nomor/:nomor', protect, letterController.getLetterByNumber);

export default router;