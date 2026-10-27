import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetch overall learner progress
 */
export const getCoachProgress = async (userId = 'guest_user') => {
  const response = await api.get('/coach/progress', {
    params: { userId }
  });
  return response.data;
};

/**
 * Fetch topic performance breakdown
 */
export const getCoachTopics = async (userId = 'guest_user') => {
  const response = await api.get('/coach/topics', {
    params: { userId }
  });
  return response.data;
};

/**
 * Fetch personalized learning recommendation
 */
export const getCoachRecommendation = async (userId = 'guest_user') => {
  const response = await api.get('/coach/recommendation', {
    params: { userId }
  });
  return response.data;
};
