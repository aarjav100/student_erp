import mongoose from 'mongoose';

let isConnecting = false;
let retryCount = 0;
const maxRetries = parseInt(process.env.MONGODB_MAX_RETRIES || '5', 10);

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const redactUri = (uri) => {
  if (!uri) return '';
  try {
    const u = new URL(uri);
    if (u.username || u.password) {
      u.username = '***';
      u.password = '***';
    }
    return u.toString();
  } catch {
    return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@');
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'erp_system';

  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Please configure it in your backend .env');
    return;
  }

  if (isConnecting) return;
  isConnecting = true;

  // Recommended opts for Mongoose v7+
  const options = {
    dbName,
    serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_MS || '15000', 10),
    socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000', 10),
    // tls/ssl is auto with mongodb+srv; ensure true if explicitly using mongodb:// to Atlas
    tls: /mongodb\+srv:/.test(uri) ? undefined : true,
  };

  while (retryCount <= maxRetries) {
    try {
      await mongoose.connect(uri, options);
      console.log(`📦 MongoDB Connected (${dbName}) via ${redactUri(uri)}`);
      isConnecting = false;
      retryCount = 0;
      return;
    } catch (error) {
      // Common Atlas misconfig hints
      if (error?.name === 'MongooseServerSelectionError') {
        console.error('❌ MongoDB server selection failed.');
        console.error('- If using MongoDB Atlas:');
        console.error('  • Use the SRV URI (mongodb+srv://...) from the Atlas UI');
        console.error('  • Whitelist your IP (0.0.0.0/0 or your current IP) in Network Access');
        console.error('  • Ensure your username/password are correct');
      }
      console.error(`❌ MongoDB connection error (attempt ${retryCount + 1}/${maxRetries + 1}):`, error?.message || error);

      retryCount += 1;
      if (retryCount > maxRetries) {
        console.error('🚫 Reached maximum MongoDB connection retries. Continuing without DB.');
        isConnecting = false;
        return;
      }
      const backoffMs = Math.min(30000, 1000 * Math.pow(2, retryCount));
      console.log(`⏳ Retrying MongoDB connection in ${Math.round(backoffMs / 1000)}s...`);
      await sleep(backoffMs);
    }
  }
};

export default connectDB;