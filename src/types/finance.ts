export type CurrencyCode = 'PKR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR';

export type UserRole = 'owner' | 'admin' | 'accountant' | 'manager' | 'member' | 'readonly';

export type AccountType = 'bank' | 'cash' | 'savings' | 'credit_card' | 'digital_wallet' | 'investment';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionStatus = 'cleared' | 'pending' | 'reconciled' | 'void';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  baseCurrency: CurrencyCode;
  taxIdentifier: string;
  role: UserRole;
}

export interface Account {
  id: string;
  orgId: string;
  name: string;
  type: AccountType;
  accountNumberMask: string;
  institutionName: string;
  currency: CurrencyCode;
  balance: number;
  initialBalance: number;
  colorHex: string;
  isArchived: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'transfer';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  orgId: string;
  accountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  exchangeRate: number;
  baseCurrencyAmount: number;
  feeAmount: number;
  date: string; // YYYY-MM-DD
  payeeOrPayer: string;
  referenceNumber: string;
  notes: string;
  status: TransactionStatus;
  receiptUrl?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  orgId: string;
  name: string;
  categoryId: string;
  allocatedAmount: number;
  period: 'monthly' | 'quarterly' | 'annual';
  warningThresholdPct: number;
}

export interface FinancialGoal {
  id: string;
  orgId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  linkedAccountId?: string;
  categoryTag: string;
  isCompleted: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  orgId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  currency: CurrencyCode;
  items: InvoiceItem[];
  subtotal: number;
  taxRatePct: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partially_paid';
  notes: string;
}

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  subType: string;
}

export interface JournalEntryLine {
  id: string;
  chartOfAccountId: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  orgId: string;
  entryNumber: string;
  entryDate: string;
  memo: string;
  isPosted: boolean;
  lines: JournalEntryLine[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  action: string;
  entityName: string;
  entityId: string;
  details: string;
  timestamp: string;
  userEmail: string;
}
