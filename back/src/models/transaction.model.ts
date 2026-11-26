import { Schema, model, type Types } from 'mongoose';

export const TRANSACTION_TYPES = ['deposit', 'withdrawal', 'transfer_out', 'transfer_in'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const DEPOSIT_SOURCES = ['counter', 'transfer'] as const;
export type DepositSource = (typeof DEPOSIT_SOURCES)[number];

export interface Transaction {
  accountId: Types.ObjectId;
  type: TransactionType;
  amountCents: number;
  source?: DepositSource;
  counterpartyAccountId?: Types.ObjectId;
  transferId?: Types.ObjectId;
  createdAt: Date;
}

const transactionSchema = new Schema<Transaction>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'BankAccount',
      required: [true, 'accountId is required'],
      immutable: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'type is required'],
      enum: { values: [...TRANSACTION_TYPES], message: 'invalid transaction type' },
      immutable: true,
    },
    amountCents: {
      type: Number,
      required: [true, 'amountCents is required'],
      immutable: true,
      validate: {
        validator: (value: number) => Number.isInteger(value) && value > 0,
        message: 'amountCents must be a strictly positive integer',
      },
    },
    source: {
      type: String,
      enum: { values: [...DEPOSIT_SOURCES], message: 'invalid deposit source' },
      immutable: true,
      required: [
        function (this: Transaction) {
          return this.type === 'deposit';
        },
        'source is required for a deposit',
      ],
    },
    counterpartyAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'BankAccount',
      immutable: true,
    },
    transferId: {
      type: Schema.Types.ObjectId,
      immutable: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

export const TransactionModel = model<Transaction>('Transaction', transactionSchema);