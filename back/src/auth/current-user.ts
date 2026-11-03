import type { Request } from 'express';
import { HttpError } from '../errors/http-error.ts';

export function getAuthUserId(req: Request): string {
  if (!req.user) {
    throw new HttpError(401, 'Authentication required');
  }
  return req.user.id;
}