import express from 'express';
import { getProblems, getProblemById, createProblem, deleteProblem } from '../controllers/problemController.js';

const router = express.Router();

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.post('/', createProblem);
router.delete('/:id', deleteProblem);

export default router;
