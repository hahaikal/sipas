import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import { redisClient, connectRedis } from './config/redisClient';

import authRoutes from './routes/authRoutes';
import letterRoutes from './routes/letterRoutes';
import userRoutes from './routes/userRoutes'; 
import newsRoutes from './routes/newsRoutes';
import galleryRoutes from './routes/galleryRoutes';
import achievementRoutes from './routes/achievementRoutes';
import publicRoutes from './routes/publicRoutes'; 
import templateRoutes from './routes/templateRoutes';
import placeholderRoutes from './routes/placeholderRoutes';
import dispositionRoutes from './routes/dispositionRoutes';
import schoolRoutes from './routes/schoolRoutes';
import './models/User';
import './models/Letter';
import './models/News';
import './models/Gallery';
import './models/Achievement';
import './models/Otp';
import './models/School';

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sipas';

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/* app.use('/uploads', express.static('uploads')); */

app.use('/api/auth', authRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/templates', templateRoutes); 
app.use('/api/placeholders', placeholderRoutes);
app.use('/api/dispositions', dispositionRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || 'Terjadi kesalahan pada server.' });
});

async function startServer() {
  await connectRedis();

  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected successfully.');
      app.listen(PORT, () => {
        console.log(`Backend server is running on http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}

startServer();