import mongoose from 'mongoose';
import { Problem } from '../models/Problem.js';
import { SEED_PROBLEMS } from '../seed/seedProblems.js';

// Helper to filter public test cases (exclude hidden test cases for learner API)
const sanitizeProblemForLearner = (problemDoc) => {
  const p = problemDoc.toObject ? problemDoc.toObject() : { ...problemDoc };
  if (p.testCases) {
    p.testCases = p.testCases.filter(tc => !tc.isHidden);
  }
  return p;
};

/**
 * GET /api/problems
 * Query params: ?difficulty=Easy&topic=Arrays&search=two
 * Optimized for rapid response & minimal network payload size.
 */
export const getProblems = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { difficulty, topic, search } = req.query;
    const filter = {};

    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }
    if (topic && topic !== 'All') {
      filter.topic = topic;
    }
    if (search && typeof search === 'string' && search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    let problems = [];
    if (mongoose.connection.readyState === 1) {
      try {
        // Fast lean query excluding heavy testCases and solution fields
        problems = await Problem.find(filter)
          .select('_id title description difficulty topic createdAt')
          .lean()
          .sort({ createdAt: -1 });
      } catch (e) {
        console.warn(`[DB Fetch Fallback] Using memory fallback: ${e.message}`);
      }
    }

    // Memory fallback if DB has no records or is unreachable
    if (!problems || problems.length === 0) {
      problems = SEED_PROBLEMS.filter(p => {
        const matchesDiff = !difficulty || difficulty === 'All' || p.difficulty.toLowerCase() === difficulty.toLowerCase();
        const matchesTopic = !topic || topic === 'All' || p.topic.toLowerCase() === topic.toLowerCase();
        const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
        return matchesDiff && matchesTopic && matchesSearch;
      }).map((p, idx) => ({ 
        _id: `seed_${idx + 1}`,
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        topic: p.topic,
        createdAt: p.createdAt || new Date()
      }));
    }

    const durationMs = Date.now() - startTime;

    res.status(200).json({
      success: true,
      count: problems.length,
      durationMs,
      data: problems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/problems/:id
 */
export const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let problem = null;

    try {
      problem = await Problem.findById(id).lean();
    } catch (e) {
      // Non-ObjectId string or invalid format
    }

    if (!problem) {
      // Memory fallback lookup
      problem = SEED_PROBLEMS.find((p, idx) => 
        `seed_${idx + 1}` === id || 
        p.title.toLowerCase().replace(/\s+/g, '_') === id.toLowerCase() ||
        p.title.toLowerCase() === id.toLowerCase()
      );
      if (problem) {
        problem = { _id: id, ...problem };
      }
    }

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: `Problem with ID '${id}' not found`
      });
    }

    const sanitized = sanitizeProblemForLearner(problem);

    res.status(200).json({
      success: true,
      data: sanitized
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/problems
 */
export const createProblem = async (req, res, next) => {
  try {
    const { title, description, difficulty, topic, examples = [], testCases = [], starterCode } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (!difficulty || !validDifficulties.includes(difficulty)) {
      return res.status(400).json({ success: false, message: 'Difficulty must be one of: Easy, Medium, Hard' });
    }

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    let newProblem = null;
    try {
      newProblem = await Problem.create({
        title: title.trim(),
        description: description.trim(),
        difficulty,
        topic: topic.trim(),
        examples,
        testCases,
        starterCode
      });
    } catch (dbErr) {
      newProblem = {
        _id: `mem_${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        difficulty,
        topic: topic.trim(),
        examples,
        testCases,
        starterCode,
        createdAt: new Date()
      };
      SEED_PROBLEMS.push(newProblem);
    }

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: newProblem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/problems/:id
 */
export const deleteProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    let deleted = null;

    try {
      deleted = await Problem.findByIdAndDelete(id);
    } catch (e) {
      // Invalid ObjectId format
    }

    if (!deleted) {
      const index = SEED_PROBLEMS.findIndex((p, idx) => `seed_${idx + 1}` === id || p._id === id);
      if (index !== -1) {
        deleted = SEED_PROBLEMS.splice(index, 1)[0];
      }
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Problem with ID '${id}' not found`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
