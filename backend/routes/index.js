import express from 'express';
import problemRoutes from './problemRoutes.js';
import submissionRoutes from './submissionRoutes.js';
import aiRoutes from './aiRoutes.js';
import healthRoutes from './healthRoutes.js';
import coachRoutes from './coachRoutes.js';
import authRoutes from './authRoutes.js';
import { requestHint, requestReview, requestCompleteSolution } from '../controllers/aiController.js';
import { handleAgentRequest } from '../controllers/agentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', protect, submissionRoutes);
router.use('/ai', protect, aiRoutes);
router.use('/coach', protect, coachRoutes);

router.post('/hints', protect, requestHint);
router.post('/hints/solution', protect, requestCompleteSolution);
router.post('/hint/solution', protect, requestCompleteSolution);
router.post('/solution', protect, requestCompleteSolution);
router.post('/reviews', protect, requestReview);
router.post('/agent', protect, handleAgentRequest);

export default router;
