import {
  calculateProgress,
  calculateTopicPerformance,
  calculateRecommendation
} from '../services/coachService.js';

/**
 * GET /api/coach/progress
 */
export const getProgress = async (req, res, next) => {
  try {
    const userId = req.query.userId || 'guest_user';
    const progress = await calculateProgress(userId);

    res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/coach/topics
 */
export const getTopics = async (req, res, next) => {
  try {
    const userId = req.query.userId || 'guest_user';
    const topics = await calculateTopicPerformance(userId);

    res.status(200).json({
      success: true,
      topics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/coach/recommendation
 */
export const getRecommendation = async (req, res, next) => {
  try {
    const userId = req.query.userId || 'guest_user';
    const recommendation = await calculateRecommendation(userId);

    res.status(200).json({
      success: true,
      recommendation
    });
  } catch (error) {
    next(error);
  }
};
