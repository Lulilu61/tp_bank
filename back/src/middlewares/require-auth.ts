import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../auth/token.ts';
import { HttpError } from '../errors/http-error.ts';

const BEARER_PREFIX = 'Bearer ';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) {
    throw new HttpError(401, 'Missing token');
  }

  const token = header.slice(BEARER_PREFIX.length);
  req.user = { id: verifyToken(token) };
  next();
}