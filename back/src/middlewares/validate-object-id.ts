import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/http-error.ts';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export function validateObjectId(
  _req: Request,
  _res: Response,
  next: NextFunction,
  value: string,
): void {
  if (!OBJECT_ID_REGEX.test(value)) {
    next(new HttpError(400, 'Invalid id'));
    return;
  }
  next();
}