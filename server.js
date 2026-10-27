import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { connectDB } from './backend/config/db.js';
import apiRouter from './backend/routes/index.js';
import { errorHandler } from './backend/middleware/errorHandler.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

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
