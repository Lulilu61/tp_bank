import cors from 'cors';
import express from 'express';
import { errorHandler } from './middlewares/error-handler.ts';
import { notFound } from './middlewares/not-found.ts';

export const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});


app.use(notFound);
app.use(errorHandler);