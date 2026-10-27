import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codementor_ai';
  
  if (isConnected) {
    return { connected: true, uri: mongoURI };
  }

  try {
    // Setting bufferCommands to false so operations fail fast if DB is disconnected
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[MongoDB] Successfully connected to ${mongoURI}`);
    return { connected: true, uri: mongoURI };
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to ${mongoURI}: ${error.message}`);
    console.warn(`[MongoDB Info] Application running in resilient mode with mock memory fallback.`);
    isConnected = false;
    return { connected: false, uri: mongoURI, error: error.message };
  }
};

export const getDBStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'localhost',
    name: mongoose.connection.name || 'codementor_ai'
  };
};
