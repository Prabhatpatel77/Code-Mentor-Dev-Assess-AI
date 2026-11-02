import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request an adaptive hint (Level 1 -> 2 -> 3 -> 4)
 * @param {string} problemId - Problem ID
 * @param {string} code - Current learner code
 * @param {Array} testResults - Optional test execution results
 * @param {string} userId - User ID
 */
export const getAdaptiveHint = async (problemId, code = '', testResults = [], userId = 'guest_user') => {
  const response = await api.post('/ai/hint', {
    problemId,
    code,
    testResults,
    userId
  });
  return response.data;
};

/**
 * Request complete solution after reaching Hint Level 4
 * @param {string} problemId - Problem ID
 * @param {string} userId - User ID
 */
export const getCompleteSolution = async (problemId, userId = 'guest_user') => {
  const response = await api.post('/ai/hints/solution', {
    problemId,
    userId
  });
  return response.data;
};
