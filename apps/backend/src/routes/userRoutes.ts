import { Router } from 'express';
import * as userController from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';
import { verifyApiKey } from '../middleware/apiKeyMiddleware';

const router = Router();

router.route('/')
  .get(protect, admin, userController.getAllUsers)
  .post(protect, admin, userController.createUser);

router.route('/:id')
  // .get(userController.getUserById)
  .put(protect, admin, userController.updateUser)
  .delete(protect, admin, userController.deleteUser);

router.get('/by-phone/:phone', verifyApiKey, userController.getUserByPhone);

export default router;