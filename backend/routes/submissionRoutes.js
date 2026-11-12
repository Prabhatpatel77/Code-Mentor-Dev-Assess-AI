import express from 'express';
import { runCode, submitSolution } from '../controllers/submissionController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(optionalProtect);

router.post('/run', runCode);
router.post('/', submitSolution);

export default router;
