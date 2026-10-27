import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import dns from 'dns';

// Ensure Windows Node.js resolves SRV records for MongoDB Atlas clusters
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  if ((dns as any).setDefaultResultOrder) {
    (dns as any).setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore if not permitted
}

// Search for .env files
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(process.cwd(), '..', '.env'),
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DEMO_MODE: process.env.DEMO_MODE ? process.env.DEMO_MODE === 'true' : true, // Enabled by default in local dev, disabled when DEMO_MODE=false
  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb+srv://cloudskill7_db_user:69zOJCVuUGP6l5zB@aiprojects.sqdpyqi.mongodb.net/?retryWrites=true&w=majority',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'medibridge',
  JWT_SECRET: process.env.JWT_SECRET || 'medibridge_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  STORAGE_DIR: path.resolve(process.cwd(), 'storage', 'uploads'),
  MEDINSIGHT_API_URL: process.env.MEDINSIGHT_API_URL || 'http://127.0.0.1:8000',
  GENERICMEDS_API_URL: process.env.GENERICMEDS_API_URL || 'http://127.0.0.1:8001',
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://127.0.0.1:5173',
};

