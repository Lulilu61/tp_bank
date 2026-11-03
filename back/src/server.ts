import mongoose from 'mongoose';
import { app } from './app.ts';
import { env } from './config/env.ts';

await mongoose.connect(env.mongoUri);
console.log('MongoDB connected');

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});