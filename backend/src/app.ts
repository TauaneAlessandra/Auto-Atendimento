import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { globalLimiter } from './middlewares/limiter.middleware';
import routes from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { env } from './config/env.config';

dotenv.config();

const app = express();

// Middlewares globais
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(globalLimiter);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Servir arquivos de upload
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Rotas da API
app.use('/api', routes);

// 404 e error handler
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});

export default app;
