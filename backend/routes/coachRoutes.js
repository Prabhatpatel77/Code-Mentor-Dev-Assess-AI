import express from 'express';
import {
  getProgress,
  getTopics,
  getRecommendation
} from '../controllers/coachController.js';

const router = express.Router();

router.get('/progress', getProgress);
router.get('/topics', getTopics);
router.get('/recommendation', getRecommendation);

export default router;
