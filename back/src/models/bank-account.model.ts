import { Schema, model, type Types } from 'mongoose';

export const ACCOUNT_TYPES = ['checking', 'savings'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

const IBAN_REGEX = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;

export interface BankAccount {
  userId: Types.ObjectId;
  iban: string;
  type: AccountType;
  label?: string;
  balanceCents: number;
  createdAt: Date;
  updatedAt: Date;
}

const bankAccountSchema = new Schema<BankAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      immutable: true,
      index: true,
    },
    iban: {
      type: String,
      required: [true, 'iban is required'],
      trim: true,
      unique: true,
      match: [IBAN_REGEX, 'iban is invalid'],
      immutable: true,
    },
    type: {
      type: String,
      required: [true, 'type is required'],
      enum: { values: [...ACCOUNT_TYPES], message: 'type must be checking or savings' },
    },
    label: { type: String, trim: true },
    balanceCents: {
      type: Number,
      default: 0,
      min: [0, 'balanceCents must be positive or zero'],
      validate: { validator: Number.isInteger, message: 'balanceCents must be an integer' },
      immutable: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export const BankAccountModel = model<BankAccount>('BankAccount', bankAccountSchema);