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
 */
export const getAdaptiveHint = async (problemId, code = '', testResults = []) => {
  const response = await api.post('/hints', {
    problemId,
    code,
    testResults
  });
  return response.data;
};
