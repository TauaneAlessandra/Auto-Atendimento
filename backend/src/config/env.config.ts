import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET deve ser definido no arquivo .env');
}

export const env = {
  PORT: Number(process.env.PORT) || 3001,
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  UPLOAD_DIR: path.join(__dirname, '../../../uploads'),
  JWT_EXPIRES_IN: '8h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
