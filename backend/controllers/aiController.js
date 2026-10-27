import { sendToSupervisor } from '../services/aiService.js';

/**
 * Endpoint for Adaptive Hint Agent (Levels 1 to 4)
 */
export const requestHint = async (req, res, next) => {
  try {
    const { userId = 'default_user', problemId, hintLevel = 1, hintsUsed = 1, code } = req.body;

    const payload = {
      user_id: userId,
      problem_id: problemId,
      code,
      request_type: 'hint',
      hint_level: Number(hintLevel),
      hints_used: Number(hintsUsed)
    };

    const aiResult = await sendToSupervisor(payload);

    res.status(200).json({
      success: true,
      hintLevel: Number(hintLevel),
      data: aiResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint for Code Review Agent
 */
export const requestReview = async (req, res, next) => {
  try {
    const { userId = 'default_user', problemId, code, reviewResult } = req.body;

    const payload = {
      user_id: userId,
      problem_id: problemId,
      code,
      request_type: 'review',
      review_result: reviewResult
    };

    const aiResult = await sendToSupervisor(payload);

    res.status(200).json({
      success: true,
      data: aiResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint for Learning Coach Agent
 */
export const requestCoaching = async (req, res, next) => {
  try {
    const { userId = 'default_user', learnerProgress } = req.body;

    const payload = {
      user_id: userId,
      request_type: 'coach',
      learner_progress: learnerProgress
    };

    const aiResult = await sendToSupervisor(payload);

    res.status(200).json({
      success: true,
      data: aiResult
    });
  } catch (error) {
    next(error);
  }
};
