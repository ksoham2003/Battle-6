import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import routes from './routes/index.js';
import errorMiddleware from './middlewares/error.middleware.js';
import notFoundMiddleware from './middlewares/notFound.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// ─── Security ───────────────────────────────────────────────────────────────
app.use(helmet());

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 10000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please try again later.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'development' ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts, please try again later.',
  },
});

app.use(limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ─── Serve frontend build in production if available ───────────────────────────
if (env.NODE_ENV === 'production') {
  const defaultFrontendPath = path.resolve(__dirname, '../../debugbattle-frontend-broken/dist');
  const frontendBuildPath = env.FRONTEND_BUILD_PATH || defaultFrontendPath;

  if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
  }
}
// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
