import express from 'express';
import problemRoutes from './problemRoutes.js';
import submissionRoutes from './submissionRoutes.js';
import aiRoutes from './aiRoutes.js';
import healthRoutes from './healthRoutes.js';
import coachRoutes from './coachRoutes.js';
import authRoutes from './authRoutes.js';
import { requestHint, requestReview, requestCompleteSolution } from '../controllers/aiController.js';
import { handleAgentRequest } from '../controllers/agentController.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/ai', aiRoutes);
router.use('/coach', coachRoutes);
router.use('/auth', authRoutes);
router.post('/hints', requestHint);
router.post('/hints/solution', requestCompleteSolution);
router.post('/hint/solution', requestCompleteSolution);
router.post('/solution', requestCompleteSolution);
router.post('/reviews', requestReview);
router.post('/agent', handleAgentRequest);

export default router;
