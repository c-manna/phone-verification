import mongoose from 'mongoose';
import { env } from './env';

mongoose.set('strictQuery', true);

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1 && connectionPromise) {
    console.info('[db] Reusing existing MongoDB connection');
    return connectionPromise;
  }

  if (!env.mongoUri) {
    console.error('[db] MONGODB_URI is not set');
    throw new Error('MONGODB_URI is required');
  }

  console.info('[db] Connecting to MongoDB', {
    readyState: mongoose.connection.readyState,
    hasCachedPromise: Boolean(connectionPromise)
  });

  connectionPromise = mongoose.connect(env.mongoUri, {
    maxPoolSize: 10
  });

  try {
    const connection = await connectionPromise;
    console.info('[db] MongoDB connection established', {
      readyState: mongoose.connection.readyState,
      host: connection.connection.host,
      name: connection.connection.name
    });
    return connection;
  } catch (error) {
    console.error('[db] MongoDB connection failed', error);
    connectionPromise = null;
    throw error;
  }
}
