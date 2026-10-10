import { CurrencyCode, Transaction, Account, JournalEntry } from '../types/finance';

// Multi-currency baseline rates relative to USD
export const EXCHANGE_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  PKR: 280.0, // 1 USD = 280 PKR
  EUR: 0.92,  // 1 USD = 0.92 EUR
  GBP: 0.79,  // 1 USD = 0.79 GBP
  AED: 3.67,  // 1 USD = 3.67 AED
  SAR: 3.75,  // 1 USD = 3.75 SAR
};

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  // Convert from origin to USD first, then to target
  const fromRate = EXCHANGE_RATES_TO_USD[from];
  const toRate = EXCHANGE_RATES_TO_USD[to];
  const inUSD = amount / fromRate;
  const inTarget = inUSD * toRate;
  return Math.round(inTarget * 100) / 100;
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'PKR',
  options: { decimals?: number; showSymbol?: boolean } = {}
): string {
  const decimals = options.decimals ?? (currency === 'PKR' ? 0 : 2);
  const showSymbol = options.showSymbol ?? true;

  const symbols: Record<CurrencyCode, string> = {
    PKR: '₨ ',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED ',
    SAR: 'SAR ',
  };

  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return showSymbol ? `${symbols[currency]}${formattedNumber}` : formattedNumber;
}

/**
 * Validates that journal entry debits strictly equal credits
 */
export function isJournalEntryBalanced(lines: { debit: number; credit: number }[]): {
  isBalanced: boolean;
  totalDebits: number;
  totalCredits: number;
  difference: number;
} {
  const totalDebits = lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  const totalCredits = lines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  const difference = Math.abs(Math.round((totalDebits - totalCredits) * 1000) / 1000);

  return {
    isBalanced: difference < 0.001 && totalDebits > 0,
    totalDebits: Math.round(totalDebits * 100) / 100,
    totalCredits: Math.round(totalCredits * 100) / 100,
    difference,
  };
}

/**
 * Calculates net worth by converting all accounts to target base currency
 */
export function calculateNetWorth(accounts: Account[], baseCurrency: CurrencyCode): {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
} {
  let assets = 0;
  let liabilities = 0;

  accounts.forEach((acc) => {
    if (acc.isArchived) return;
    const converted = convertCurrency(acc.balance, acc.currency, baseCurrency);
    if (acc.type === 'credit_card' || acc.balance < 0) {
      liabilities += Math.abs(converted);
    } else {
      assets += converted;
    }
  });

  return {
    totalAssets: Math.round(assets * 100) / 100,
    totalLiabilities: Math.round(liabilities * 100) / 100,
    netWorth: Math.round((assets - liabilities) * 100) / 100,
  };
}

/**
 * Calculates income, expense and net cashflow for a given transaction list
 */
export function calculateCashFlow(
  transactions: Transaction[],
  baseCurrency: CurrencyCode
): {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
} {
  let income = 0;
  let expense = 0;

  transactions.forEach((tx) => {
    if (tx.status === 'void') return;
    const converted = convertCurrency(tx.amount, tx.currency, baseCurrency);
    if (tx.type === 'income') {
      income += converted;
    } else if (tx.type === 'expense') {
      expense += converted;
    }
    // Note: transfers are neutral to income/expense
  });

  const netCashFlow = income - expense;
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0;

  return {
    totalIncome: Math.round(income * 100) / 100,
    totalExpenses: Math.round(expense * 100) / 100,
    netCashFlow: Math.round(netCashFlow * 100) / 100,
    savingsRate,
  };
}
