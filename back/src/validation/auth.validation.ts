import { HttpError } from '../errors/http-error.ts';
import { parseBody, requiredString } from './body.ts';
import type { CreateUserInput } from './user.validation.ts';

export interface RegisterInput extends CreateUserInput {
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

const MIN_PASSWORD_LENGTH = 8;

export function parseRegister(body: unknown): RegisterInput {
  const data = parseBody(body, ['firstName', 'lastName', 'email', 'password']);
  const password = requiredString(data, 'password');
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `password must contain at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  return {
    firstName: requiredString(data, 'firstName'),
    lastName: requiredString(data, 'lastName'),
    email: requiredString(data, 'email'),
    password,
  };
}

export function parseLogin(body: unknown): LoginInput {
  const data = parseBody(body, ['email', 'password']);
  return {
    email: requiredString(data, 'email'),
    password: requiredString(data, 'password'),
  };
}