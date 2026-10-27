import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

// Do not hang queries if MongoDB is not connected
mongoose.set('bufferCommands', false);

export async function connectDatabase(timeoutMs = 1500): Promise<typeof mongoose | null> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Fast path for test runner or when explicitly skipped
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    console.log('[MediBridge AI] Running in test mode - using resilient in-memory store.');
    isConnected = false;
    return null;
  }

  try {
    console.log('[MediBridge AI] Connecting to MongoDB Atlas...');
    const connectPromise = mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: timeoutMs,
      connectTimeoutMS: timeoutMs,
    });

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Atlas connection attempt timed out')), timeoutMs)
    );

    const conn = await Promise.race([connectPromise, timeoutPromise]);
    if (conn) {
      isConnected = true;
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} [db: ${env.MONGODB_DB_NAME}]`);
      return conn;
    }
    return null;
  } catch (error: any) {
    isConnected = false;
    console.warn(`⚠️ MongoDB connection note: ${error?.message || error}. Running in resilient mode.`);
    return null;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
