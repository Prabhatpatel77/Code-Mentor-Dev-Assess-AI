import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Execute code against test cases (Run Code)
 * @param {string} problemId - Problem ID
 * @param {string} code - JavaScript user code
 */
export const runCode = async (problemId, code) => {
  const response = await api.post('/submissions/run', {
    problemId,
    code
  });
  return response.data;
};

/**
 * Submit solution and record result (Submit Solution)
 * @param {string} problemId - Problem ID
 * @param {string} code - JavaScript user code
 * @param {string} userId - User ID (optional)
 */
export const submitSolution = async (problemId, code, userId = 'guest_user') => {
  const response = await api.post('/submissions', {
    problemId,
    code,
    userId
  });
  return response.data;
};
