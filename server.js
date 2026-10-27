import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { connectDB } from './backend/config/db.js';
import apiRouter from './backend/routes/index.js';
import { errorHandler } from './backend/middleware/errorHandler.js';

dotenv.config();

// Ensure AI_SERVICE_URL routes to Python service on port 5000 (avoiding control-plane-api collision on port 8000)
if (!process.env.AI_SERVICE_URL || process.env.AI_SERVICE_URL === 'http://localhost:8000') {
  process.env.AI_SERVICE_URL = 'http://localhost:5000';
}

function ensureAIServiceRunning() {
  const req = http.get('http://127.0.0.1:5000/health', (res) => {
    console.log('[CodeMentorAI] Python AI Service is active on port 5000');
  });
  req.on('error', () => {
    console.log('[CodeMentorAI] Spawning Python AI Service on port 5000...');
    const pythonProc = spawn('python3', ['ai-service/main.py'], {
      env: { ...process.env, AI_SERVICE_PORT: '5000' },
      detached: true,
      stdio: 'ignore'
    });
    pythonProc.unref();
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

  // Ensure Python AI service is running
  ensureAIServiceRunning();

  // Connect MongoDB (with fallback handling if local Mongo is not running)
  await connectDB();

  // Mount backend API router
  app.use('/api', apiRouter);

  // Mount Vite development server middleware for frontend SPA
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  // Centralized Error Handling
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CodeMentorAI] Unified Server running at http://localhost:${PORT}`);
    console.log(`[CodeMentorAI] Health endpoint: http://localhost:${PORT}/api/health`);
  });
}

startServer();
