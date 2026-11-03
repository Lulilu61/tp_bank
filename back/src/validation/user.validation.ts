import { HttpError } from '../errors/http-error.ts';
import { optionalString, parseBody, requiredString } from './body.ts';

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
}

export type UpdateUserInput = Partial<CreateUserInput>;

const USER_FIELDS = ['firstName', 'lastName', 'email'] as const;

export function parseCreateUser(body: unknown): CreateUserInput {
  const data = parseBody(body, USER_FIELDS);
  return {
    firstName: requiredString(data, 'firstName'),
    lastName: requiredString(data, 'lastName'),
    email: requiredString(data, 'email'),
  };
}

export function parseUpdateUser(body: unknown): UpdateUserInput {
  const data = parseBody(body, USER_FIELDS);
  const update: UpdateUserInput = {};
  for (const field of USER_FIELDS) {
    const value = optionalString(data, field);
    if (value !== undefined) {
      update[field] = value;
    }
  }
  if (Object.keys(update).length === 0) {
    throw new HttpError(400, 'No field to update');
  }
  return update;
}