import mongoose from 'mongoose';
import axios from 'axios';
import { Problem } from '../models/Problem.js';
import { Submission } from '../models/Submission.js';
import { HintUsage } from '../models/HintUsage.js';
import { SEED_PROBLEMS } from '../seed/seedProblems.js';
import { getMemorySubmissions } from '../controllers/submissionController.js';
import { getMemoryHintUsages } from '../controllers/aiController.js';

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL && process.env.AI_SERVICE_URL !== 'http://localhost:8000') 
  ? process.env.AI_SERVICE_URL 
  : 'http://localhost:5000';

/**
 * Normalizes problem ID for matching across string IDs and MongoDB ObjectIds
 */
const normalizeId = (id) => {
  if (!id) return '';
  return String(id).trim();
};

/**
 * Retrieve all problems (from DB or seed fallback)
 */
export const getAllProblems = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbProblems = await Problem.find({}).lean();
      if (dbProblems && dbProblems.length > 0) {
        return dbProblems;
      }
    } catch (e) {
      console.warn(`[CoachService] Problem fetch fallback: ${e.message}`);
    }
  }
  return SEED_PROBLEMS.map((p, idx) => ({ _id: `seed_${idx + 1}`, ...p }));
};

/**
 * Retrieve all user submissions for specified userId (DB or memory fallback)
 * STRICT DATA ISOLATION: Returns ONLY submissions matching userId
 */
export const getUserSubmissions = async (userId = 'guest_user') => {
  const targetId = String(userId).trim();
  let submissions = [];

  if (mongoose.connection.readyState === 1) {
    try {
      submissions = await Submission.find({ userId: targetId }).lean();
    } catch (e) {
      console.warn(`[CoachService] Submission fetch fallback: ${e.message}`);
    }
  }

  if (!submissions || submissions.length === 0) {
    const memoryList = getMemorySubmissions();
    submissions = memoryList.filter(s => String(s.userId).trim() === targetId);
  }

  return submissions || [];
};

/**
 * Retrieve all user hint usages for specified userId (DB or memory fallback)
 * STRICT DATA ISOLATION: Returns ONLY hint usages matching userId
 */
export const getUserHints = async (userId = 'guest_user') => {
  const targetId = String(userId).trim();
  let hints = [];

  if (mongoose.connection.readyState === 1) {
    try {
      hints = await HintUsage.find({ userId: targetId }).lean();
    } catch (e) {
      console.warn(`[CoachService] HintUsage fetch fallback: ${e.message}`);
    }
  }

  if (!hints || hints.length === 0) {
    const memoryList = getMemoryHintUsages();
    hints = memoryList.filter(h => String(h.userId).trim() === targetId);
  }

  return hints || [];
};

/**
 * Calculate Comprehensive Progress & Learning Metrics for Authenticated Student
 */
export const calculateProgress = async (userId = 'guest_user') => {
  const submissions = await getUserSubmissions(userId);
  const hints = await getUserHints(userId);
  const problems = await getAllProblems();

  // Create lookup for problem metadata
  const problemMap = new Map();
  problems.forEach((p, idx) => {
    const id = normalizeId(p._id) || `seed_${idx + 1}`;
    problemMap.set(id, p);
  });

  const attemptedProblemIds = new Set();
  const solvedProblemIds = new Set();
  const difficultyStats = {
    Easy: { attempted: new Set(), solved: new Set() },
    Medium: { attempted: new Set(), solved: new Set() },
    Hard: { attempted: new Set(), solved: new Set() }
  };

  let totalSubmissions = submissions.length;
  let acceptedSubmissions = 0;

  // Process submissions
  submissions.forEach((sub) => {
    const pId = normalizeId(sub.problemId);
    if (!pId) return;

    attemptedProblemIds.add(pId);
    const prob = problemMap.get(pId);
    const diff = prob ? prob.difficulty || 'Easy' : 'Easy';

    if (difficultyStats[diff]) {
      difficultyStats[diff].attempted.add(pId);
    }

    if (sub.status === 'Accepted') {
      solvedProblemIds.add(pId);
      acceptedSubmissions++;
      if (difficultyStats[diff]) {
        difficultyStats[diff].solved.add(pId);
      }
    }
  });

  const attempted = attemptedProblemIds.size;
  const solved = solvedProblemIds.size;
  const failed = Math.max(0, attempted - solved);
  const accuracy = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;

  // Hint metrics breakdown
  const hintsUsed = hints.length;
  const hintsByLevel = { level1: 0, level2: 0, level3: 0, level4: 0 };
  let solutionReveals = 0;

  hints.forEach((h) => {
    const lvl = Number(h.hintLevel);
    if (lvl === 1) hintsByLevel.level1++;
    else if (lvl === 2) hintsByLevel.level2++;
    else if (lvl === 3) hintsByLevel.level3++;
    else if (lvl === 4) hintsByLevel.level4++;
    else if (lvl >= 5 || h.hintLevel === 'solution' || h.isCompleteSolution) {
      solutionReveals++;
    }
  });

  const averageHints = attempted > 0 ? parseFloat((hintsUsed / attempted).toFixed(1)) : 0;

  // Difficulty performance breakdown
  const difficultyPerformance = ['Easy', 'Medium', 'Hard'].map((diff) => {
    const att = difficultyStats[diff].attempted.size;
    const sol = difficultyStats[diff].solved.size;
    const acc = att > 0 ? Math.round((sol / att) * 100) : 0;
    return { difficulty: diff, attempted: att, solved: sol, accuracy: acc };
  });

  // Recent activity (last 5 submissions)
  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)
    .map((sub) => {
      const prob = problemMap.get(normalizeId(sub.problemId));
      return {
        id: sub._id,
        problemId: sub.problemId,
        problemTitle: prob ? prob.title : 'Coding Challenge',
        status: sub.status,
        testsPassed: sub.testsPassed || 0,
        totalTests: sub.totalTests || 0,
        createdAt: sub.createdAt || new Date()
      };
    });

  return {
    attempted,
    solved,
    failed,
    accuracy,
    totalSubmissions,
    acceptedSubmissions,
    hintsUsed,
    hintsByLevel,
    solutionReveals,
    averageHints,
    difficultyPerformance,
    recentSubmissions
  };
};

/**
 * Calculate Topic Performance
 */
export const calculateTopicPerformance = async (userId = 'guest_user') => {
  const problems = await getAllProblems();
  const submissions = await getUserSubmissions(userId);

  const problemMap = new Map();
  problems.forEach((p, idx) => {
    const id = normalizeId(p._id) || `seed_${idx + 1}`;
    problemMap.set(id, p);
  });

  const problemAttempts = new Set();
  const problemSolves = new Set();

  submissions.forEach((sub) => {
    const pId = normalizeId(sub.problemId);
    if (pId) {
      problemAttempts.add(pId);
      if (sub.status === 'Accepted') {
        problemSolves.add(pId);
      }
    }
  });

  const topicStats = new Map();

  // Initialize with topics from problem catalog
  problems.forEach((p) => {
    const topic = p.topic || 'General';
    if (!topicStats.has(topic)) {
      topicStats.set(topic, {
        topic,
        attemptedProblemIds: new Set(),
        solvedProblemIds: new Set()
      });
    }
  });

  problemAttempts.forEach((pId) => {
    const prob = problemMap.get(pId);
    const topic = prob ? (prob.topic || 'General') : 'General';
    if (!topicStats.has(topic)) {
      topicStats.set(topic, {
        topic,
        attemptedProblemIds: new Set(),
        solvedProblemIds: new Set()
      });
    }
    const stat = topicStats.get(topic);
    stat.attemptedProblemIds.add(pId);

    if (problemSolves.has(pId)) {
      stat.solvedProblemIds.add(pId);
    }
  });

  const topicsResult = [];
  topicStats.forEach((stat, topic) => {
    const attempted = stat.attemptedProblemIds.size;
    const solved = stat.solvedProblemIds.size;
    const accuracy = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;

    topicsResult.push({
      topic,
      attempted,
      solved,
      accuracy
    });
  });

  return topicsResult;
};

/**
 * Generate Rule-based Recommendation with Optional AI Explanation
 * References ONLY existing problems in the database catalog.
 */
export const calculateRecommendation = async (userId = 'guest_user') => {
  const problems = await getAllProblems();
  const progress = await calculateProgress(userId);
  const topics = await calculateTopicPerformance(userId);

  let targetTopic = 'Arrays';
  let targetDifficulty = 'Easy';
  let reason = 'Start your learning journey with foundational Easy problems in Arrays.';

  if (progress.attempted === 0) {
    targetTopic = 'Arrays';
    targetDifficulty = 'Easy';
    reason = 'No problems attempted yet. Solve your first problem to start tracking performance.';
  } else {
    const attemptedTopics = topics.filter(t => t.attempted > 0);
    const weakTopics = attemptedTopics.filter(t => t.accuracy < 60);

    if (weakTopics.length > 0) {
      weakTopics.sort((a, b) => a.accuracy - b.accuracy);
      const weakest = weakTopics[0];
      targetTopic = weakest.topic;
      targetDifficulty = 'Easy';
      reason = `Your current accuracy in ${weakest.topic} is ${weakest.accuracy}%, which is below 60%. Re-focusing on foundational practice will build confidence.`;
    } else {
      const mostActiveTopic = attemptedTopics.sort((a, b) => b.attempted - a.attempted)[0]?.topic || 'Arrays';
      targetTopic = mostActiveTopic;

      if (progress.accuracy < 50) {
        targetDifficulty = 'Easy';
        reason = `Your overall accuracy is ${progress.accuracy}%. Focus on Easy problems in ${targetTopic} to solidify core syntax and logic.`;
      } else if (progress.accuracy <= 80) {
        targetDifficulty = 'Medium';
        reason = `Solid overall performance (${progress.accuracy}% accuracy). Take on Medium difficulty challenges in ${targetTopic} to level up algorithmic skills.`;
      } else {
        targetDifficulty = 'Hard';
        reason = `Outstanding performance with ${progress.accuracy}% accuracy! Master advanced concepts with Medium and Hard ${targetTopic} challenges.`;
      }
    }
  }

  // Find an un-solved problem matching target topic & difficulty from database
  const solvedSet = new Set(
    (await getUserSubmissions(userId))
      .filter(s => s.status === 'Accepted')
      .map(s => normalizeId(s.problemId))
  );

  let targetProblem = problems.find(p => 
    p.topic === targetTopic && 
    p.difficulty === targetDifficulty && 
    !solvedSet.has(normalizeId(p._id))
  );

  // Fallback to any problem matching target topic if exact difficulty solved
  if (!targetProblem) {
    targetProblem = problems.find(p => p.topic === targetTopic && !solvedSet.has(normalizeId(p._id)));
  }

  // Ultimate fallback to first available problem in DB
  if (!targetProblem && problems.length > 0) {
    targetProblem = problems[0];
  }

  const recommendation = {
    topic: targetProblem ? targetProblem.topic : targetTopic,
    difficulty: targetProblem ? targetProblem.difficulty : targetDifficulty,
    targetProblemId: targetProblem ? String(targetProblem._id) : null,
    targetProblemTitle: targetProblem ? targetProblem.title : 'Two Sum',
    reason
  };

  // Optional AI Explanation via existing Python AI Service
  let explanation = recommendation.reason;
  try {
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/coach/explain`, {
      progress,
      recommendation
    }, { timeout: 4000 });

    if (aiResponse.data && aiResponse.data.explanation) {
      explanation = aiResponse.data.explanation;
    }
  } catch (aiErr) {
    // Graceful deterministic fallback
    explanation = `${recommendation.reason} Recommended next step: practice ${recommendation.targetProblemTitle} (${recommendation.difficulty}).`;
  }

  return {
    ...recommendation,
    explanation
  };
};
