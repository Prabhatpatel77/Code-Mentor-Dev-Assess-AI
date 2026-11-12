import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Unified LangGraph Supervisor Agent Call
 * @param {Object} payload - { request_type: 'hint'|'review'|'coach', ... }
 */
export const invokeSupervisorAgent = async (payload) => {
  const response = await api.post('/agent', payload);
  return response.data;
};
