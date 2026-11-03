import cors from 'cors';
import express from 'express';
import { docsRouter } from './doc.ts';
import { errorHandler } from './middlewares/error-handler.ts';
import { notFound } from './middlewares/not-found.ts';
import { requireAuth } from './middlewares/require-auth.ts';
import { validateObjectId } from './middlewares/validate-object-id.ts';
import { accountsRouter } from './routes/accounts.routes.ts';
import { authRouter } from './routes/auth.routes.ts';
import { usersRouter } from './routes/users.route.ts';


export const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use('/api/docs', docsRouter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

usersRouter.param('id', validateObjectId);

app.use('/api/auth', authRouter);
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/accounts', requireAuth, accountsRouter);


app.use(notFound);
app.use(errorHandler);