import express from 'express';
import { requestHint, requestReview, requestCoaching } from '../controllers/aiController.js';

const router = express.Router();

router.post('/hint', requestHint);
router.post('/review', requestReview);
router.post('/coach', requestCoaching);

export default router;
