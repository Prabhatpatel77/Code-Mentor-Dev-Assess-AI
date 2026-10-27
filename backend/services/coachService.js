import mongoose from 'mongoose';
import axios from 'axios';
import { Problem } from '../models/Problem.js';
import { Submission } from '../models/Submission.js';
import { HintUsage } from '../models/HintUsage.js';
import { SEED_PROBLEMS } from '../seed/seedProblems.js';
import { getMemorySubmissions } from '../controllers/submissionController.js';
import { getMemoryHintUsages } from '../controllers/aiController.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

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
      const dbProblems = await Problem.find({});
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
 * Retrieve all user submissions (DB or memory fallback)
 */
export const getUserSubmissions = async (userId = 'guest_user') => {
  let submissions = [];
  if (mongoose.connection.readyState === 1) {
    try {
      submissions = await Submission.find({ userId });
    } catch (e) {
      console.warn(`[CoachService] Submission fetch fallback: ${e.message}`);
    }
  }
  if (!submissions || submissions.length === 0) {
    const memoryList = getMemorySubmissions();
    submissions = memoryList.filter(s => !userId || s.userId === userId || s.userId === 'guest_user' || s.userId === 'default_user');
  }
  return submissions || [];
};

/**
 * Retrieve all user hint usages (DB or memory fallback)
 */
export const getUserHints = async (userId = 'guest_user') => {
  let hints = [];
  if (mongoose.connection.readyState === 1) {
    try {
      hints = await HintUsage.find({ userId });
    } catch (e) {
      console.warn(`[CoachService] HintUsage fetch fallback: ${e.message}`);
    }
  }
  if (!hints || hints.length === 0) {
    const memoryList = getMemoryHintUsages();
    hints = memoryList.filter(h => !userId || h.userId === userId || h.userId === 'guest_user' || h.userId === 'default_user');
  }
  return hints || [];
};

/**
 * Calculate Overall Progress
 */
export const calculateProgress = async (userId = 'guest_user') => {
  const submissions = await getUserSubmissions(userId);
  const hints = await getUserHints(userId);

  const attemptedProblemIds = new Set();
  const solvedProblemIds = new Set();

  submissions.forEach((sub) => {
    const pId = normalizeId(sub.problemId);
    if (pId) {
      attemptedProblemIds.add(pId);
      if (sub.status === 'Accepted') {
        solvedProblemIds.add(pId);
      }
    }
  });

  const attempted = attemptedProblemIds.size;
  const solved = solvedProblemIds.size;
  const totalHints = hints.length;

  const accuracy = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;
  const averageHints = attempted > 0 ? parseFloat((totalHints / attempted).toFixed(1)) : 0;

  return {
    attempted,
    solved,
    accuracy,
    averageHints
  };
};

/**
 * Calculate Topic Performance
 */
export const calculateTopicPerformance = async (userId = 'guest_user') => {
  const problems = await getAllProblems();
  const submissions = await getUserSubmissions(userId);

  // Map problemId -> Problem details
  const problemMap = new Map();
  problems.forEach((p, idx) => {
    const id = normalizeId(p._id) || `seed_${idx + 1}`;
    problemMap.set(id, p);
    if (p.title) {
      problemMap.set(p.title.toLowerCase().replace(/\s+/g, '_'), p);
      problemMap.set(p.title.toLowerCase(), p);
    }
  });

  // Track attempts and solves per problem
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

  // Discover all unique topics
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

  // Attribute attempts and solves to topics
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
 */
export const calculateRecommendation = async (userId = 'guest_user') => {
  const progress = await calculateProgress(userId);
  const topics = await calculateTopicPerformance(userId);

  let recommendation = {
    topic: 'Arrays',
    difficulty: 'Easy',
    reason: 'Start your learning journey with foundational Easy problems in Arrays.'
  };

  if (progress.attempted === 0) {
    recommendation = {
      topic: 'Arrays',
      difficulty: 'Easy',
      reason: 'No problems attempted yet. Solve your first problem to start tracking performance.'
    };
  } else {
    // 1. Weak topic rule (accuracy < 60% on attempted topics)
    const attemptedTopics = topics.filter(t => t.attempted > 0);
    const weakTopics = attemptedTopics.filter(t => t.accuracy < 60);

    if (weakTopics.length > 0) {
      // Find weakest topic
      weakTopics.sort((a, b) => a.accuracy - b.accuracy);
      const weakest = weakTopics[0];
      recommendation = {
        topic: weakest.topic,
        difficulty: 'Easy',
        reason: `Your current accuracy in ${weakest.topic} is ${weakest.accuracy}%, which is below 60%.`
      };
    } else {
      // 2. Overall performance rule
      const mostActiveTopic = attemptedTopics.sort((a, b) => b.attempted - a.attempted)[0]?.topic || 'Arrays';

      if (progress.accuracy < 50) {
        recommendation = {
          topic: mostActiveTopic,
          difficulty: 'Easy',
          reason: 'Your overall accuracy is below 50%. Focus on foundational Easy problems.'
        };
      } else if (progress.accuracy <= 80) {
        recommendation = {
          topic: mostActiveTopic,
          difficulty: 'Medium',
          reason: 'You have built a solid foundation (overall accuracy between 50% and 80%). Ready for Medium problems.'
        };
      } else {
        recommendation = {
          topic: mostActiveTopic,
          difficulty: 'Medium/Hard',
          reason: 'Outstanding performance with overall accuracy over 80%! Ready for Medium/Hard challenges.'
        };
      }
    }
  }

  // 3. Optional AI Explanation via existing Python AI Service
  let explanation = recommendation.reason;
  try {
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/coach/explain`, {
      progress,
      recommendation
    }, { timeout: 6000 });

    if (aiResponse.data && aiResponse.data.explanation) {
      explanation = aiResponse.data.explanation;
    }
  } catch (aiErr) {
    // Graceful fallback to deterministic explanation
    explanation = `${recommendation.reason} Practicing ${recommendation.difficulty} problems in ${recommendation.topic} will help reinforce your core problem-solving intuition.`;
  }

  return {
    ...recommendation,
    explanation
  };
};
