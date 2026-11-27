import mongoose from 'mongoose';
import { HttpError } from '../errors/http-error.ts';
import { BankAccountModel, type BankAccount } from '../models/bank-account.model.ts';
import { TransactionModel, type DepositSource } from '../models/transaction.model.ts';

export async function deposit(
  accountId: string,
  amountCents: number,
  source: DepositSource,
): Promise<BankAccount> {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const account = await BankAccountModel.findByIdAndUpdate(
        accountId,
        { $inc: { balanceCents: amountCents } },
        { new: true, session },
      );
      if (!account) {
        throw new HttpError(404, 'Account not found');
      }

      await TransactionModel.create(
        [{ accountId, type: 'deposit', amountCents, source }],
        { session },
      );

      return account;
    });
  } finally {
    await session.endSession();
  }
}

export async function withdraw(accountId: string, amountCents: number): Promise<BankAccount> {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      // Check and update in one atomic operation: the filter guarantees the balance is sufficient
      const account = await BankAccountModel.findOneAndUpdate(
        { _id: accountId, balanceCents: { $gte: amountCents } },
        { $inc: { balanceCents: -amountCents } },
        { new: true, session },
      );

      if (!account) {
        // No document matched: either the account does not exist, or the balance is too low
        const exists = await BankAccountModel.exists({ _id: accountId }).session(session);
        throw exists
          ? new HttpError(409, 'Insufficient balance')
          : new HttpError(404, 'Account not found');
      }

      await TransactionModel.create(
        [{ accountId, type: 'withdrawal', amountCents }],
        { session },
      );

      return account;
    });
  } finally {
    await session.endSession();
  }
}