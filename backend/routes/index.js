import express from 'express';
import problemRoutes from './problemRoutes.js';
import submissionRoutes from './submissionRoutes.js';
import aiRoutes from './aiRoutes.js';
import healthRoutes from './healthRoutes.js';
import coachRoutes from './coachRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import { requestHint, requestReview, requestCompleteSolution } from '../controllers/aiController.js';
import { handleAgentRequest } from '../controllers/agentController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', optionalProtect, submissionRoutes);
router.use('/ai', optionalProtect, aiRoutes);
router.use('/coach', optionalProtect, coachRoutes);
router.use('/admin', adminRoutes);

router.post('/hints', optionalProtect, requestHint);
router.post('/hints/solution', optionalProtect, requestCompleteSolution);
router.post('/hint/solution', optionalProtect, requestCompleteSolution);
router.post('/solution', optionalProtect, requestCompleteSolution);
router.post('/reviews', optionalProtect, requestReview);
router.post('/agent', optionalProtect, handleAgentRequest);

export default router;
