import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
  return value;
};

const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres para garantir segurança');
}

required('DATABASE_URL');

export const env = {
  PORT: parseInt(process.env.PORT ?? '3001', 10),
  JWT_SECRET: jwtSecret,
  DATABASE_URL: process.env.DATABASE_URL!,
  NODE_ENV: process.env.NODE_ENV || 'development',
  UPLOAD_DIR: path.join(__dirname, '../../../uploads'),
  JWT_EXPIRES_IN: '8h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('CORS_ORIGIN deve ser definido em produção'); })() : 'http://localhost:5173'),
  ORDER_VALIDITY_DAYS: parseInt(process.env.ORDER_VALIDITY_DAYS ?? '15', 10),
  DASHBOARD_LOOKBACK_MONTHS: parseInt(process.env.DASHBOARD_LOOKBACK_MONTHS ?? '6', 10),
};
