import type { Request } from 'express';
import { Router } from 'express';
import { Types } from 'mongoose';
import { getAuthUserId } from '../auth/current-user.ts';
import { HttpError } from '../errors/http-error.ts';
import { validateObjectId } from '../middlewares/validate-object-id.ts';
import type { BankAccount } from '../models/bank-account.model.ts';
import { BankAccountModel } from '../models/bank-account.model.ts';
import { UserModel } from '../models/user.model.ts';
import { deposit } from '../services/account-operations.service.ts';
import {
  parseAccountFilter,
  parseCreateAccount,
  parseLookup,
  parseUpdateAccount,
} from '../validation/bank-account.validation.ts';
import { parseDeposit } from '../validation/transaction.validation.ts';

export const accountsRouter = Router();

accountsRouter.param('id', validateObjectId);

// GET /api/accounts/lookup?iban=...
accountsRouter.get('/lookup', async (req, res) => {
  const { iban } = parseLookup(req.query);

  const account = await BankAccountModel.findOne({ iban }).select('userId');
  if (!account) {
    throw new HttpError(404, 'No account found for this IBAN');
  }

  const holder = await UserModel.findById(account.userId).select('firstName lastName');
  if (!holder) {
    throw new HttpError(404, 'No account found for this IBAN');
  }

  // Privacy: first name and initial of the last name only
  res.status(200).json({
    holderName: `${holder.firstName} ${holder.lastName.charAt(0).toUpperCase()}.`,
  });
});

function assertAccountOwner(account: Pick<BankAccount, 'userId'>, req: Request): void {
  if (account.userId.toString() !== getAuthUserId(req)) {
    throw new HttpError(403, 'This account does not belong to you');
  }
}

// GET /api/accounts: only the logged-in user's accounts
accountsRouter.get('/', async (req, res) => {
  const filter = parseAccountFilter(req.query);
  const currentUserId = getAuthUserId(req);

  if (filter.userId && filter.userId.toString() !== currentUserId) {
    throw new HttpError(403, 'You can only list your own accounts');
  }
  filter.userId = new Types.ObjectId(currentUserId);

  const accounts = await BankAccountModel.find(filter);
  res.status(200).json(accounts);
});

// GET /api/accounts/:id
accountsRouter.get('/:id', async (req, res) => {
  const account = await BankAccountModel.findById(req.params.id);
  if (!account) {
    throw new HttpError(404, 'Account not found');
  }
  assertAccountOwner(account, req);
  res.status(200).json(account);
});

// POST /api/accounts
accountsRouter.post('/', async (req, res) => {
  const input = parseCreateAccount(req.body);

  if (input.userId.toString() !== getAuthUserId(req)) {
    throw new HttpError(403, 'You can only create accounts for yourself');
  }

  // Business rule 2: the owner must exist
  const ownerExists = await UserModel.exists({ _id: input.userId });
  if (!ownerExists) {
    throw new HttpError(400, 'User does not exist');
  }

  const account = await BankAccountModel.create(input);
  res.status(201).json(account);
});

// POST /api/accounts/:id/deposits
accountsRouter.post('/:id/deposits', async (req, res) => {
  const input = parseDeposit(req.body);

  // Ownership is checked before any write
  const account = await BankAccountModel.findById(req.params.id);
  if (!account) {
    throw new HttpError(404, 'Account not found');
  }
  assertAccountOwner(account, req);

  const updated = await deposit(req.params.id, input.amountCents, input.source);
  res.status(201).json(updated);
});

// PATCH /api/accounts/:id
accountsRouter.patch('/:id', async (req, res) => {
  const update = parseUpdateAccount(req.body);
  const account = await BankAccountModel.findById(req.params.id);
  if (!account) {
    throw new HttpError(404, 'Account not found');
  }
  account.set(update);
  await account.save();
  res.status(200).json(account);
});

// DELETE /api/accounts/:id
accountsRouter.delete('/:id', async (req, res) => {
  const account = await BankAccountModel.findById(req.params.id);
  if (!account) {
    throw new HttpError(404, 'Account not found');
  }

  // Rule : only an empty account can be deleted
  if (account.balanceCents !== 0) {
    throw new HttpError(409, 'Account balance must be zero before deletion');
  }

  await account.deleteOne();
  res.status(204).end();
});