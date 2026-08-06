import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Local files import karte waqt .js extension zaroori hai
import './models/User.js';
import './models/Task.js';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();

// 1. Initialize Express App
const app = express();

// 2. Middlewares
app.use(cors());
app.use(express.json());

console.log('Models Loaded Successfully!');

// 3. Routes Definition
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 4. MongoDB Connection Setup
const MONGO_URI = process.env.MONGO_URI;
console.log("Connecting to MongoDB...");

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully to Atlas!');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is happily running on port ${PORT}`);
});