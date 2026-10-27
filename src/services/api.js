import axios from 'axios';
import { getProblems, getProblemById, createProblem, deleteProblem } from './problemService.js';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchHealthStatus = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Delegate problem calls to problemService
export const fetchProblems = (filters) => getProblems(filters);
export const fetchProblemById = (id) => getProblemById(id);
export { createProblem, deleteProblem };
export { invokeSupervisorAgent } from './agentService.js';

export const submitCodeSolution = async (problemId, code, userId = 'default_user') => {
  const response = await api.post('/submissions', {
    problemId,
    code,
    userId
  });
  return response.data;
};

export const requestAdaptiveHint = async (problemId, hintLevel, hintsUsed, code) => {
  const response = await api.post('/ai/hint', {
    problemId,
    hintLevel,
    hintsUsed,
    code
  });
  return response.data;
};

export const requestCodeReview = async (problemId, code, reviewResult) => {
  const response = await api.post('/ai/review', {
    problemId,
    code,
    reviewResult
  });
  return response.data;
};

export const requestCoachRecommendations = async (learnerProgress) => {
  const response = await api.post('/ai/coach', {
    learnerProgress
  });
  return response.data;
};

export default api;
