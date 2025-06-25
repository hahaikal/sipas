import { Router } from 'express';
import * as userController from '../controllers/userController';
import { protect, admin, requireAdminOrKepsek } from '../middleware/authMiddleware';
import { verifyApiKey } from '../middleware/apiKeyMiddleware';

const router = Router();

router.route('/')
  .get(protect, requireAdminOrKepsek, userController.getAllUsers)
  .post(protect, requireAdminOrKepsek, userController.createUser);

router.route('/:id')
  // .get(userController.getUserById)
  .put(protect, requireAdminOrKepsek, userController.updateUser)
  .delete(protect, requireAdminOrKepsek, userController.deleteUser);

router.get('/by-phone/:phone', verifyApiKey, userController.getUserByPhone);

export default router;