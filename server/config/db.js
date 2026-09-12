import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dns from 'node:dns';

// Fix for Windows / Node.js querySrv ECONNREFUSED with certain ISP/router DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore fallback
}

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`[Database] Attempting connection to external MongoDB Atlas...`);
      const conn = await mongoose.connect(uri.trim(), {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`[Database] Connected to MongoDB Atlas/External at: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] Failed to connect to external MONGODB_URI: ${err.message}`);
      console.log('[Database] Falling back to automated in-memory MongoDB for local execution...');
    }
  }

  // Fallback to in-memory MongoDB
  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to local in-memory MongoDB at: ${memoryUri}`);
    return conn;
  } catch (err) {
    console.error(`[Database] Critical error starting in-memory MongoDB: ${err.message}`);
    throw err;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
