import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/auth.js';
import lessonRoutes from './routes/lessons.js';
import chatRoutes from './routes/chat.js';
import ussdRoutes from './routes/ussd.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false })); // USSD gateways send form data

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Slow down guessing of PINs and abuse of the chat helper.
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 50 }));
app.use('/api/chat', rateLimit({ windowMs: 60 * 1000, limit: 20 }));

app.use('/api/auth', authRoutes);
app.use('/api', lessonRoutes);
app.use('/api', chatRoutes);
app.use('/api', ussdRoutes);

// In production the built frontend is served from the same server.
const dist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

const port = Number(process.env.PORT) || 4000;
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(port, () => console.log(`Easy Learn API running on http://localhost:${port}`));
}

export default app;
