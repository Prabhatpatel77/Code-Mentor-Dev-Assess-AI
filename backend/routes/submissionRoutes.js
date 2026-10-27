import express from 'express';
import { runCode, submitSolution } from '../controllers/submissionController.js';

const router = express.Router();

router.post('/run', runCode);
router.post('/', submitSolution);

export default router;
