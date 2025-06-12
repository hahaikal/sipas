import { Router } from 'express';
import * as userController from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

router.route('/')
  .get(protect, admin, userController.getAllUsers)
  .post(protect, admin, userController.createUser);

export default router;