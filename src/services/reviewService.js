import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request an AI Code Review for submitted code
 * @param {string} problemId - Problem ID
 * @param {string} code - Learner JavaScript code
 */
export const getCodeReview = async (problemId, code) => {
  const response = await api.post('/reviews', {
    problemId,
    code
  });
  return response.data;
};
