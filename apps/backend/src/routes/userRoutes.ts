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
  .put(userController.updateUser)
  .delete(userController.deleteUser);

router.get('/by-phone/:phone', verifyApiKey, userController.getUserByPhone);

export default router;