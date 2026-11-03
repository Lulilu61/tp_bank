import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/http-error.ts';
import { isObjectId } from '../validation/object-id.ts';

export function validateObjectId(
  _req: Request,
  _res: Response,
  next: NextFunction,
  value: string,
): void {
  if (!isObjectId(value)) {
    next(new HttpError(400, 'Invalid id'));
    return;
  }
  next();
}