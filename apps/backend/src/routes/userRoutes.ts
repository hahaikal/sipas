import { Router } from 'express';
import * as userController from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

// Terapkan middleware 'protect' dan 'admin' pada rute ini
// Ini berarti hanya admin yang sudah login yang bisa mengaksesnya
router.route('/')
  .get(protect, admin, userController.getAllUsers);

export default router;