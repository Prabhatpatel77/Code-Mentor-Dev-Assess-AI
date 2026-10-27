import { executeJavaScript } from '../services/codeExecutor.js';
import { SEED_PROBLEMS } from '../seed/seedProblems.js';
import { Problem } from '../models/Problem.js';
import { Submission } from '../models/Submission.js';

export const memorySubmissions = [];
export const getMemorySubmissions = () => memorySubmissions;

/**
 * POST /api/submissions/run
 * Executes submitted code against test cases without creating a database submission record
 */
export const runCode = async (req, res, next) => {
  try {
    const { problemId, code } = req.body;

    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: 'problemId is required'
      });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'code is required and must be a string'
      });
    }

    // Retrieve problem
    let problem = null;
    try {
      problem = await Problem.findById(problemId);
    } catch (e) {
      // Invalid ObjectId format or DB error
    }

    if (!problem) {
      problem = SEED_PROBLEMS.find((p, idx) => 
        `seed_${idx + 1}` === problemId || 
        p._id === problemId || 
        p.title.toLowerCase().replace(/\s+/g, '_') === problemId.toLowerCase()
      );
    }

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: `Problem with ID '${problemId}' not found`
      });
    }

    // Execute code against test cases (filtering public test cases if isHidden exists)
    const testCasesToRun = problem.testCases 
      ? problem.testCases.filter(tc => !tc.isHidden)
      : [];

    const executionResult = executeJavaScript(code, testCasesToRun.length > 0 ? testCasesToRun : problem.testCases || []);

    res.status(200).json({
      success: true,
      passed: executionResult.passed,
      total: executionResult.total,
      results: executionResult.results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/submissions
 * Executes solution, evaluates all test cases, and stores submission record
 */
export const submitSolution = async (req, res, next) => {
  try {
    const { problemId, code, userId = 'guest_user' } = req.body;

    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: 'problemId is required'
      });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'code is required and must be a string'
      });
    }

    // Retrieve problem
    let problem = null;
    try {
      problem = await Problem.findById(problemId);
    } catch (e) {
      // Invalid ObjectId format
    }

    if (!problem) {
      problem = SEED_PROBLEMS.find((p, idx) => 
        `seed_${idx + 1}` === problemId || 
        p._id === problemId || 
        p.title.toLowerCase().replace(/\s+/g, '_') === problemId.toLowerCase()
      );
    }

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: `Problem with ID '${problemId}' not found`
      });
    }

    // Execute against all test cases for official submission
    const executionResult = executeJavaScript(code, problem.testCases || []);

    // Create Submission record in DB or memory fallback
    const submissionData = {
      userId,
      problemId,
      code,
      status: executionResult.status,
      passedTests: executionResult.passed,
      totalTests: executionResult.total,
      executionTimeMs: executionResult.executionTimeMs,
      createdAt: new Date()
    };

    memorySubmissions.push({
      ...submissionData,
      testResults: executionResult.results
    });

    try {
      await Submission.create({
        ...submissionData,
        testResults: executionResult.results
      });
    } catch (dbErr) {
      console.warn(`[Submission DB Warning] Saved in memory fallback: ${dbErr.message}`);
    }

    res.status(200).json({
      success: true,
      status: executionResult.status,
      passed: executionResult.passed,
      total: executionResult.total,
      results: executionResult.results
    });
  } catch (error) {
    next(error);
  }
};
