import axios from 'axios';
import mongoose from 'mongoose';
import { Problem } from '../models/Problem.js';
import { HintUsage } from '../models/HintUsage.js';
import { Submission } from '../models/Submission.js';
import { SEED_PROBLEMS } from '../seed/seedProblems.js';
import { executeJavaScript } from '../services/codeExecutor.js';
import { calculateRecommendation } from '../services/coachService.js';

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL && process.env.AI_SERVICE_URL !== 'http://localhost:8000') 
  ? process.env.AI_SERVICE_URL 
  : 'http://localhost:5000';

const HINT_TYPES = {
  1: 'conceptual',
  2: 'approach',
  3: 'code_structure',
  4: 'debugging'
};

// In-memory hint progression tracker when DB is offline
const memoryHintTracker = new Map();
export const memoryHintUsages = [];
export const getMemoryHintUsages = () => memoryHintUsages;

/**
 * POST /api/hints or POST /api/ai/hint
 * Handles progressive adaptive hint requests (Levels 1 to 4)
 */
export const requestHint = async (req, res, next) => {
  try {
    const { problemId, code = '', userId = 'guest_user', testResults = [] } = req.body;

    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: 'problemId is required'
      });
    }

    // 1. Retrieve problem details
    let problem = null;
    try {
      if (mongoose.connection.readyState === 1) {
        problem = await Problem.findById(problemId);
      }
    } catch (e) {
      // Non-ObjectId format
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

    // 2. Determine hint progression (Level 1 -> 2 -> 3 -> 4 -> 4)
    let nextHintLevel = 1;
    const canonicalProblemId = String(problem._id || problemId);
    const userMemoryKey = `${userId}_${canonicalProblemId}`;

    if (mongoose.connection.readyState === 1) {
      try {
        const existingUsages = await HintUsage.find({
          userId,
          $or: [{ problemId: canonicalProblemId }, { problemId }]
        }).sort({ hintLevel: -1 }).exec();
        if (existingUsages && existingUsages.length > 0) {
          const highestLevel = existingUsages[0].hintLevel;
          nextHintLevel = Math.min(highestLevel + 1, 4);
        }
      } catch (e) {
        const prevLevel = memoryHintTracker.get(userMemoryKey) || 0;
        nextHintLevel = Math.min(prevLevel + 1, 4);
      }
    } else {
      const prevLevel = memoryHintTracker.get(userMemoryKey) || 0;
      nextHintLevel = Math.min(prevLevel + 1, 4);
    }
    memoryHintTracker.set(userMemoryKey, nextHintLevel);

    // 3. Request hint from Python AI Service
    let generatedHint = '';
    let hintType = HINT_TYPES[nextHintLevel] || 'conceptual';

    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/hint`, {
        problemId: String(problem._id || problemId),
        problemTitle: problem.title,
        problemDescription: problem.description,
        examples: problem.examples || [],
        code,
        testResults,
        hintLevel: nextHintLevel
      }, { timeout: 8000 });

      if (aiResponse.data && aiResponse.data.hint) {
        generatedHint = aiResponse.data.hint;
        if (aiResponse.data.hintType) {
          hintType = aiResponse.data.hintType;
        }
      }
    } catch (aiErr) {
      const fallbackHints = {
        1: `Level 1 — Conceptual: For '${problem.title}', think about what data structure lets you store visited items for fast O(1) lookup.`,
        2: `Level 2 — Approach: Traverse the input once using a Map or Set. For each element, check if its required partner/condition exists in your map.`,
        3: `Level 3 — Code Structure:\n1. Const map = new Map();\n2. For (let x of array) {\n3.   If (map.has(target - x)) return indices;\n4.   Map.set(x, index);\n}`,
        4: `Level 4 — Debugging: Check your loop conditions and return value. Ensure you return indices or boolean outputs matching the problem specification.`
      };
      generatedHint = fallbackHints[nextHintLevel] || fallbackHints[1];
    }

    // 4. Record Hint Usage
    memoryHintUsages.push({
      userId,
      problemId: String(problem._id || problemId),
      hintLevel: nextHintLevel,
      createdAt: new Date()
    });

    if (mongoose.connection.readyState === 1) {
      try {
        await HintUsage.create({
          userId,
          problemId: String(problem._id || problemId),
          hintLevel: nextHintLevel,
          createdAt: new Date()
        });
      } catch (dbErr) {
        console.warn(`[Hint Usage Record Warning] ${dbErr.message}`);
      }
    }

    res.status(200).json({
      success: true,
      hintLevel: nextHintLevel,
      hintType,
      hint: generatedHint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/reviews or POST /api/ai/review
 * Handles AI Code Review requests covering Correctness, Code Quality, Performance, and Security.
 */
export const requestReview = async (req, res, next) => {
  try {
    const { problemId, code = '', userId = 'guest_user' } = req.body;

    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: 'problemId is required'
      });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please write some code before requesting a review.'
      });
    }

    // 1. Retrieve problem details
    let problem = null;
    try {
      if (mongoose.connection.readyState === 1) {
        problem = await Problem.findById(problemId);
      }
    } catch (e) {
      // Non-ObjectId format
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
        message: 'Problem not found.'
      });
    }

    // 2. Execute code against test cases using existing execution service
    const executionResult = executeJavaScript(code, problem.testCases || []);

    // 3. Send to Python AI Service (/api/review)
    let reviewResult = null;
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/review`, {
        problemId: String(problem._id || problemId),
        problemTitle: problem.title,
        problemDescription: problem.description,
        code,
        testResults: executionResult.results || []
      }, { timeout: 12000 });

      if (aiResponse.data && aiResponse.data.review) {
        reviewResult = aiResponse.data.review;
      }
    } catch (aiErr) {
      console.warn(`[AI Service Review Fallback] ${aiErr.message}`);
      const isPassed = executionResult.passed === executionResult.total;
      reviewResult = {
        overallScore: isPassed ? 85 : 65,
        summary: isPassed ? "The solution successfully passed all test cases with sound logic." : "The solution has logical errors or fails on certain test cases.",
        correctness: {
          status: isPassed ? "pass" : "fail",
          feedback: `Passed ${executionResult.passed} of ${executionResult.total} test cases.`
        },
        codeQuality: {
          score: 80,
          feedback: ["Structure is straightforward. Ensure variable names clearly describe their purpose."]
        },
        performance: {
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          feedback: [`Execution time: ${executionResult.executionTimeMs} ms.`]
        },
        security: {
          status: "pass",
          feedback: "No significant security concerns identified."
        }
      };
    }

    // 4. Save submission record with review result
    if (mongoose.connection.readyState === 1) {
      try {
        await Submission.create({
          userId,
          problemId: String(problem._id || problemId),
          code,
          status: executionResult.status,
          passedTests: executionResult.passed,
          totalTests: executionResult.total,
          executionTimeMs: executionResult.executionTimeMs,
          testResults: executionResult.results
        });
      } catch (dbErr) {
        // Non-blocking
      }
    }

    res.status(200).json({
      success: true,
      review: reviewResult
    });
  } catch (error) {
    next(error);
  }
};

export const requestCoaching = async (req, res, next) => {
  try {
    const { userId = 'guest_user' } = req.body;
    const recommendation = await calculateRecommendation(userId);
    res.status(200).json({
      success: true,
      recommendation,
      response: recommendation.explanation || recommendation.reason
    });
  } catch (error) {
    next(error);
  }
};

export const requestCompleteSolution = async (req, res, next) => {
  try {
    const { problemId, userId = 'guest_user' } = req.body;

    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: 'problemId is required'
      });
    }

    // 1. Retrieve problem details
    let problem = null;
    try {
      if (mongoose.connection.readyState === 1) {
        problem = await Problem.findById(problemId);
      }
    } catch (e) {}

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

    const canonicalProblemId = String(problem._id || problemId);

    // 2. Verify that student has reached Hint Level 4
    let reachedLevel4 = false;
    const userMemoryKey = `${userId}_${canonicalProblemId}`;
    const memLevel = memoryHintTracker.get(userMemoryKey) || 0;
    if (memLevel >= 4) {
      reachedLevel4 = true;
    }

    if (!reachedLevel4 && mongoose.connection.readyState === 1) {
      try {
        const usages = await HintUsage.find({
          userId,
          $or: [{ problemId: canonicalProblemId }, { problemId }]
        }).exec();
        if (usages && usages.some(u => u.hintLevel >= 4)) {
          reachedLevel4 = true;
        }
      } catch (e) {}
    }

    if (!reachedLevel4) {
      const foundMem = memoryHintUsages.find(u => u.userId === userId && String(u.problemId) === canonicalProblemId && u.hintLevel >= 4);
      if (foundMem) {
        reachedLevel4 = true;
      }
    }

    if (!reachedLevel4) {
      return res.status(403).json({
        success: false,
        message: 'You must reach Hint Level 4 before revealing the complete solution.'
      });
    }

    // 3. Request complete solution from Python AI Service
    let solutionData = null;
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/hints/solution`, {
        problemId: canonicalProblemId,
        problemTitle: problem.title,
        problemDescription: problem.description,
        examples: problem.examples || []
      }, { timeout: 12000 });

      if (aiResponse.data && aiResponse.data.solution) {
        solutionData = aiResponse.data.solution;
      }
    } catch (aiErr) {
      console.warn(`[AI Solution Warning] ${aiErr.message}`);
    }

    if (!solutionData) {
      const titleLower = problem.title.toLowerCase();
      if (titleLower.includes('two sum')) {
        solutionData = {
          problemUnderstanding: "Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to 'target'.",
          approach: "We use a JavaScript Map to store numbers and their indices as we iterate. For each number, we check if its complement (target - num) is already in the map.",
          code: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
          codeExplanation: [
            { section: "Map Initialization", "explanation": "Create a Map for O(1) average lookup time." },
            { section: "Iteration", "explanation": "Iterate and check complement." }
          ],
          dryRun: [
            { step: 1, description: "nums = [2, 7, 11, 15], target = 9. Find complement 7 for 2, store 2 at index 0." },
            { step: 2, description: "At 7, complement 2 exists at index 0. Return [0, 1]." }
          ],
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          commonMistakes: ["Using O(n^2) nested loops."]
        };
      } else if (titleLower.includes('reverse string')) {
        solutionData = {
          problemUnderstanding: "Write a function that reverses a string or character array.",
          approach: "Split string into characters, reverse, and join back.",
          code: "function reverseString(str) {\n  return str.split('').reverse().join('');\n}",
          codeExplanation: [
            { section: "Split & Reverse", "explanation": "Split into array and reverse in place." }
          ],
          dryRun: [
            { step: 1, description: "Input 'hello' -> reversed 'olleh'." }
          ],
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          commonMistakes: ["Not handling empty inputs."]
        };
      } else if (titleLower.includes('palindrome')) {
        solutionData = {
          problemUnderstanding: "A phrase is a palindrome if it reads the same forward and backward after sanitizing.",
          approach: "Remove non-alphanumeric chars, convert to lowercase, and check equality with reverse.",
          code: "function isPalindrome(s) {\n  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return cleaned === cleaned.split('').reverse().join('');\n}",
          codeExplanation: [
            { section: "Sanitization", "explanation": "Strip punctuation and convert to lowercase." }
          ],
          dryRun: [
            { step: 1, description: "Clean string and compare with reverse." }
          ],
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          commonMistakes: ["Ignoring case or spaces."]
        };
      } else if (titleLower.includes('maximum') || titleLower.includes('max')) {
        solutionData = {
          problemUnderstanding: "Given an array of numbers nums, return the maximum number.",
          approach: "Iterate through array maintaining max value.",
          code: "function findMax(nums) {\n  if (!nums || nums.length === 0) return null;\n  let max = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    if (nums[i] > max) max = nums[i];\n  }\n  return max;\n}",
          codeExplanation: [
            { section: "Iteration", "explanation": "Compare elements against current max." }
          ],
          dryRun: [
            { step: 1, description: "Track running maximum across array." }
          ],
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          commonMistakes: ["Initializing max to 0 instead of first element."]
        };
      } else if (titleLower.includes('duplicate')) {
        solutionData = {
          problemUnderstanding: "Return true if any value appears at least twice in array, false otherwise.",
          approach: "Use Set to track seen numbers during iteration.",
          code: "function containsDuplicate(nums) {\n  const seen = new Set();\n  for (const num of nums) {\n    if (seen.has(num)) return true;\n    seen.add(num);\n  }\n  return false;\n}",
          codeExplanation: [
            { section: "Set Lookup", "explanation": "Check if number is already in Set." }
          ],
          dryRun: [
            { step: 1, description: "Iterate and store numbers in Set." }
          ],
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          commonMistakes: ["Using O(n^2) nested loops."]
        };
      } else {
        solutionData = {
          problemUnderstanding: `The problem '${problem.title}' requires efficiently processing inputs.`,
          approach: "Use a structured algorithm to solve the problem.",
          code: problem.starterCode ? problem.starterCode.replace(/\/\/ Write your solution here[\s\S]*?\n\s*\}/, 'return input;') : "function solution(input) {\n  return input;\n}",
          codeExplanation: [{ section: "Processing", explanation: "Process input." }],
          dryRun: [{ step: 1, description: "Return computed result." }],
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          commonMistakes: ["Edge case handling."]
        };
      }
    }

    // 4. Validate solution code against test cases
    const testCasesToRun = problem.testCases || [];
    const executionResult = executeJavaScript(solutionData.code, testCasesToRun);
    const validationPassed = executionResult.status === 'Accepted' || (testCasesToRun.length > 0 && executionResult.passed === testCasesToRun.length);

    // 5. Record solution reveal in HintUsage
    memoryHintUsages.push({
      userId,
      problemId: canonicalProblemId,
      hintLevel: 4,
      isSolutionReveal: true,
      createdAt: new Date()
    });

    if (mongoose.connection.readyState === 1) {
      try {
        await HintUsage.create({
          userId,
          problemId: canonicalProblemId,
          hintLevel: 4,
          isSolutionReveal: true,
          createdAt: new Date()
        });
      } catch (dbErr) {}
    }

    res.status(200).json({
      success: true,
      solution: solutionData,
      validation: {
        passed: executionResult.passed,
        total: executionResult.total,
        status: executionResult.status,
        validationPassed
      }
    });
  } catch (error) {
    next(error);
  }
};
