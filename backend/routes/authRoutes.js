import express from 'express';
import { register, login, adminLogin, createAdminAccount, logout, getMe } from '../controllers/authController.js';
import { protect, adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/admin/create', protect, adminProtect, createAdminAccount);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
