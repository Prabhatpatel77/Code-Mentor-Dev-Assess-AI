import express from 'express';
import { submitSolution } from '../controllers/submissionController.js';

const router = express.Router();

router.post('/', submitSolution);

export default router;
