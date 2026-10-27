import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetch list of problems with optional filtering
 * @param {Object} filters - { difficulty, topic }
 */
export const getProblems = async (filters = {}) => {
  const params = {};
  if (filters.difficulty && filters.difficulty !== 'All') {
    params.difficulty = filters.difficulty;
  }
  if (filters.topic && filters.topic !== 'All') {
    params.topic = filters.topic;
  }

  const response = await api.get('/problems', { params });
  return response.data;
};

/**
 * Fetch a single problem by ID
 * @param {string} id - Problem ID
 */
export const getProblemById = async (id) => {
  const response = await api.get(`/problems/${id}`);
  return response.data;
};

/**
 * Create a new problem
 * @param {Object} problemData - Problem definition
 */
export const createProblem = async (problemData) => {
  const response = await api.post('/problems', problemData);
  return response.data;
};

/**
 * Delete a problem
 * @param {string} id - Problem ID
 */
export const deleteProblem = async (id) => {
  const response = await api.delete(`/problems/${id}`);
  return response.data;
};
