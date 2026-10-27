import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Checks connectivity to the Python FastAPI AI Service
 */
export const checkAIServiceHealth = async () => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 2000 });
    return {
      active: true,
      url: AI_SERVICE_URL,
      details: response.data
    };
  } catch (error) {
    return {
      active: false,
      url: AI_SERVICE_URL,
      message: `AI Service offline or unreachable at ${AI_SERVICE_URL}`,
      error: error.message
    };
  }
};

/**
 * Dispatches request to Python LangGraph Supervisor
 */
export const sendToSupervisor = async (payload) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/supervisor/process`, payload, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      status: 'SERVICE_UNAVAILABLE',
      message: `Failed to communicate with AI Service at ${AI_SERVICE_URL}. Ensure Python FastAPI app is running on port 8000.`,
      error: error.message,
      response: `[Not implemented yet] AI Agent Service endpoint setup verified. Full LangGraph agent orchestration will be active in Prompt 2.`
    };
  }
};
