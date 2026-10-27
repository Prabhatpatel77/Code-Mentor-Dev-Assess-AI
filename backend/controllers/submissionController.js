import { executeJavaScript } from '../services/codeExecutionService.js';
import { INITIAL_PROBLEMS } from './problemController.js';
import { Problem } from '../models/Problem.js';
import { Submission } from '../models/Submission.js';

export const submitSolution = async (req, res, next) => {
  try {
    const { problemId, code, userId = 'default_user' } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Both problemId and code are required.'
      });
    }

    // Retrieve problem details and test cases
    let problem = null;
    try {
      problem = await Problem.findById(problemId);
    } catch (e) {
      // Fallback to seed problem
    }

    if (!problem) {
      problem = INITIAL_PROBLEMS.find(p => p._id === problemId);
    }

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: `Problem '${problemId}' not found.`
      });
    }

    // Execute code against problem test cases
    const executionResult = executeJavaScript(code, problem.testCases || []);

    const submissionData = {
      userId,
      problemId,
      code,
      status: executionResult.status,
      testsPassed: executionResult.testsPassed,
      totalTests: executionResult.totalTests,
      executionTimeMs: executionResult.executionTimeMs,
      testResults: executionResult.testResults
    };

    try {
      await Submission.create(submissionData);
    } catch (e) {
      // Memory fallback if DB is offline
    }

    res.status(200).json({
      success: true,
      data: submissionData
    });
  } catch (error) {
    next(error);
  }
};
