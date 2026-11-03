import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/http-error.ts';

export function requireSelf(
  req: Request,
  _res: Response,
  next: NextFunction,
  value: string,
): void {
  const userId = req.user?.id;
  if (userId === undefined) {
    next(new HttpError(401, 'Authentication required'));
    return;
  }
  if (value.toLowerCase() !== userId) {
    next(new HttpError(403, 'You can only access your own profile'));
    return;
  }
  next();
}