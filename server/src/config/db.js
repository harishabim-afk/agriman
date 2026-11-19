import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI in environment variables');
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas!');
};

export const closeDB = async () => {
  await mongoose.connection.close();
  console.log('MongoDB Atlas connection closed.');
};