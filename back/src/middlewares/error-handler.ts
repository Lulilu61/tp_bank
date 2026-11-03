import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { HttpError } from '../errors/http-error.ts';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Errors thrown on purpose in our routes
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  // Broken JSON in the request body (sent by express.json)
  if (typeof err === 'object' && err !== null && 'type' in err && err.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Invalid JSON body' });
    return;
  }

  // Mongoose schema validation (required, match, enum...)
  if (err instanceof mongoose.Error.ValidationError) {
    const firstError = Object.values(err.errors)[0];
    res.status(400).json({ message: firstError?.message ?? 'Invalid data' });
    return;
  }

  // Value that cannot be converted (for example an invalid id)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: `Invalid value for ${err.path}` });
    return;
  }

  // Unique index violated in MongoDB (duplicate email or IBAN)
  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'value';
    res.status(409).json({ message: `${field} already used` });
    return;
  }

  // Anything else: log it for us, hide details from the client
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}