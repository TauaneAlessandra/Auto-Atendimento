import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';
import { globalLimiter } from './middlewares/limiter.middleware';
import routes from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { env } from './config/env.config';

dotenv.config();

const app = express();

// Cabeçalhos de segurança HTTP
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(compression());

// CORS
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Rate limiting global
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Servir arquivos de upload com cabeçalhos seguros
app.use('/uploads', (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Rotas da API
app.use('/api', routes);

// 404 e error handler
app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT ?? '3001', 10);
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

export default app;
