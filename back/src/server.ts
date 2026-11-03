import mongoose from 'mongoose';
import { app } from './app.ts';

const PORT = Number(process.env.PORT ?? 3000);
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/owl_bank';

await mongoose.connect(MONGO_URI);
console.log('MongoDB connected');

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});