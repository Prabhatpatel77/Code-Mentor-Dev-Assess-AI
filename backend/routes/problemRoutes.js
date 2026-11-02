import express from 'express';
import { getProblems, getProblemById, createProblem, deleteProblem } from '../controllers/problemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProblems);
router.get('/:id', protect, getProblemById);
router.post('/', protect, createProblem);
router.delete('/:id', protect, deleteProblem);

export default router;
