import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Centralized error handler
app.use(errorHandler);

export { app };

if (process.env.NODE_ENV !== 'test' && !process.env.VITE_DEV_MODE) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[Express Backend] Running on http://localhost:${PORT}`);
    });
  });
}
