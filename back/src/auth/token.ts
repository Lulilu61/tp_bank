import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';

export function signToken(userId: string): string {
  return jwt.sign({}, env.jwtSecret, {
    algorithm: 'HS256',
    subject: userId,
    expiresIn: env.jwtExpiresInSeconds,
  });
}