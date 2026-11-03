import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';
import { HttpError } from '../errors/http-error.ts';

export function signToken(userId: string): string {
  return jwt.sign({}, env.jwtSecret, {
    algorithm: 'HS256',
    subject: userId,
    expiresIn: env.jwtExpiresInSeconds,
  });
}

// Returns the user id stored in the token, or throws a 401
export function verifyToken(token: string): string {
  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, 'Token expired');
    }
    throw new HttpError(401, 'Invalid token');
  }

  if (typeof payload === 'string' || typeof payload.sub !== 'string') {
    throw new HttpError(401, 'Invalid token');
  }
  return payload.sub;
}