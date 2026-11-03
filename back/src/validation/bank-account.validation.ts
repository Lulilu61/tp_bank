import { Types } from 'mongoose';
import { HttpError } from '../errors/http-error.ts';
import { parseBody, requiredString, optionalString, type JsonObject } from './body.ts';
import { isObjectId } from './object-id.ts';
import { ACCOUNT_TYPES, type AccountType } from '../models/bank-account.model.ts';

export interface CreateAccountInput {
  userId: Types.ObjectId;
  iban: string;
  type: AccountType;
  label?: string | undefined;
  balanceCents?: number | undefined;
}

export interface UpdateAccountInput {
  label?: string;
  type?: AccountType;
}

export interface AccountFilter {
  userId?: Types.ObjectId;
  type?: AccountType;
}

function isAccountType(value: string): value is AccountType {
  return ACCOUNT_TYPES.some((accountType) => accountType === value);
}

function parseAccountType(value: string): AccountType {
  if (!isAccountType(value)) {
    throw new HttpError(400, 'type must be "checking" or "savings"');
  }
  return value;
}

function parseObjectId(value: string, field: string): Types.ObjectId {
  if (!isObjectId(value)) {
    throw new HttpError(400, `${field} is not a valid id`);
  }
  return new Types.ObjectId(value);
}

function parseBalance(data: JsonObject): number | undefined {
  const value = data.balanceCents;
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new HttpError(400, 'balanceCents must be a positive integer or zero');
  }
  return value;
}

export function parseCreateAccount(body: unknown): CreateAccountInput {
  const data = parseBody(body, ['userId', 'iban', 'type', 'label', 'balanceCents']);
  return {
    userId: parseObjectId(requiredString(data, 'userId'), 'userId'),
    iban: requiredString(data, 'iban'),
    type: parseAccountType(requiredString(data, 'type')),
    label: optionalString(data, 'label'),
    balanceCents: parseBalance(data),
  };
}

// only label and type can be modified
export function parseUpdateAccount(body: unknown): UpdateAccountInput {
  const data = parseBody(body, ['label', 'type']);
  const update: UpdateAccountInput = {};
  const label = optionalString(data, 'label');
  if (label !== undefined) {
    update.label = label;
  }
  const type = optionalString(data, 'type');
  if (type !== undefined) {
    update.type = parseAccountType(type);
  }
  if (Object.keys(update).length === 0) {
    throw new HttpError(400, 'No field to update');
  }
  return update;
}

// Filters for GET /api/accounts?userId=...&type=...
export function parseAccountFilter(query: unknown): AccountFilter {
  const data = parseBody(query, ['userId', 'type']);
  const filter: AccountFilter = {};
  const userId = optionalString(data, 'userId');
  if (userId !== undefined) {
    filter.userId = parseObjectId(userId, 'userId');
  }
  const type = optionalString(data, 'type');
  if (type !== undefined) {
    filter.type = parseAccountType(type);
  }
  return filter;
}