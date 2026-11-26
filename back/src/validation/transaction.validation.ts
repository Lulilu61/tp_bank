import { HttpError } from '../errors/http-error.ts';
import { DEPOSIT_SOURCES, type DepositSource } from '../models/transaction.model.ts';
import { parseBody, requiredString, type JsonObject } from './body.ts';
import { isIban } from './iban.ts';

// Business rule: maximum amount of one operation, 10 000 Snails
export const MAX_OPERATION_CENTS = 1_000_000;

export interface AmountInput {
  amountCents: number;
}

export interface DepositInput extends AmountInput {
  source: DepositSource;
}

export interface TransferInput extends AmountInput {
  toIban: string;
}

function isDepositSource(value: string): value is DepositSource {
  return DEPOSIT_SOURCES.some((source) => source === value);
}

function parseAmountCents(data: JsonObject): number {
  const value = data.amountCents;
  if (value === undefined) {
    throw new HttpError(400, 'amountCents is required');
  }
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new HttpError(400, 'amountCents must be an integer');
  }
  if (value <= 0) {
    throw new HttpError(400, 'amountCents must be greater than 0');
  }
  if (value > MAX_OPERATION_CENTS) {
    throw new HttpError(400, 'amountCents exceeds the limit of 10000 Snails per operation');
  }
  return value;
}

// POST /api/accounts/:id/deposits
export function parseDeposit(body: unknown): DepositInput {
  const data = parseBody(body, ['amountCents', 'source']);
  const source = requiredString(data, 'source');
  if (!isDepositSource(source)) {
    throw new HttpError(400, 'source must be "counter" or "transfer"');
  }
  return { amountCents: parseAmountCents(data), source };
}

// POST /api/accounts/:id/withdrawals
export function parseWithdrawal(body: unknown): AmountInput {
  const data = parseBody(body, ['amountCents']);
  return { amountCents: parseAmountCents(data) };
}

// POST /api/accounts/:id/transfers
export function parseTransfer(body: unknown): TransferInput {
  const data = parseBody(body, ['amountCents', 'toIban']);
  const toIban = requiredString(data, 'toIban').trim().toUpperCase();
  if (!isIban(toIban)) {
    throw new HttpError(400, 'toIban is not a valid IBAN');
  }
  return { amountCents: parseAmountCents(data), toIban };
}