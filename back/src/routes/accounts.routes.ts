import { Router } from 'express';
import { HttpError } from '../errors/http-error.ts';
import { validateObjectId } from '../middlewares/validate-object-id.ts';
import { BankAccountModel } from '../models/bank-account.model.ts';
import { UserModel } from '../models/user.model.ts';
import {
    parseAccountFilter,
    parseCreateAccount,
    parseUpdateAccount,
} from '../validation/bank-account.validation.ts';

export const accountsRouter = Router();

accountsRouter.param('id', validateObjectId);

// GET /api/accounts?userId=...&type=...
accountsRouter.get('/', async (req, res) => {
  const filter = parseAccountFilter(req.query);
  const accounts = await BankAccountModel.find(filter);
  res.status(200).json(accounts);
});

// GET /api/accounts/:id
accountsRouter.get('/:id', async (req, res) => {
  const account = await BankAccountModel.findById(req.params.id);
  if (!account) {
    throw new HttpError(404, 'Account not found');
  }
  res.status(200).json(account);
});

// POST /api/accounts
accountsRouter.post('/', async (req, res) => {
  const input = parseCreateAccount(req.body);

  // Rule : the owner must exist
  const ownerExists = await UserModel.exists({ _id: input.userId });
  if (!ownerExists) {
    throw new HttpError(400, 'User does not exist');
  }

  const account = await BankAccountModel.create(input);
  res.status(201).json(account);
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