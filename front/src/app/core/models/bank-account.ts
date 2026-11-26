export type AccountType = 'checking' | 'savings';

// Shape of an account as returned by the API (JSON)
export interface BankAccount {
  _id: string;
  userId: string;
  iban: string;
  type: AccountType;
  label?: string;
  balanceCents: number;
  createdAt: string;
  updatedAt: string;
}

// POST /api/accounts
export interface CreateAccountBody {
  userId: string;
  iban: string;
  type: AccountType;
  label?: string;
  balanceCents?: number;
}

// PATCH /api/accounts/:id: only label and type can be modified
export type UpdateAccountBody = Partial<Pick<BankAccount, 'label' | 'type'>>;