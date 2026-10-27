import { getDBStatus } from '../config/db.js';
import { checkAIServiceHealth } from '../services/aiService.js';

export const getHealthStatus = async (req, res, next) => {
  try {
    const dbStatus = getDBStatus();
    const aiServiceHealth = await checkAIServiceHealth();

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      services: {
        backend: {
          status: 'healthy',
          nodeVersion: process.version,
          uptimeSeconds: Math.floor(process.uptime()),
          port: process.env.PORT || 5000
        },
        database: {
          status: dbStatus.connected ? 'connected' : 'disconnected',
          host: dbStatus.host,
          database: dbStatus.name,
          fallbackMode: !dbStatus.connected
        },
        aiService: aiServiceHealth
      }
    });
  } catch (error) {
    next(error);
  }
};
