import express from 'express';
import { requestHint, requestReview, requestCoaching, requestCompleteSolution } from '../controllers/aiController.js';

const router = express.Router();

router.post('/hint', requestHint);
router.post('/hints', requestHint);
router.post('/hints/solution', requestCompleteSolution);
router.post('/hint/solution', requestCompleteSolution);
router.post('/solution', requestCompleteSolution);
router.post('/review', requestReview);
router.post('/coach', requestCoaching);

export default router;
