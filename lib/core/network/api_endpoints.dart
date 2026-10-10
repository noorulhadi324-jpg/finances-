class ApiEndpoints {
  // Base URL configured via environment or runtime settings
  static const String defaultBaseUrl = 'https://api.finova.internal/v1';

  // Auth endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String profile = '/auth/profile';
  static const String refreshToken = '/auth/refresh';

  // Organizations
  static const String organizations = '/organizations';
  static String organization(String orgId) => '/organizations/$orgId';

  // Financial Accounts
  static const String accounts = '/accounts';
  static String account(String accountId) => '/accounts/$accountId';
  static String accountTransactions(String accountId) => '/accounts/$accountId/transactions';

  // Transactions & Transfers
  static const String transactions = '/transactions';
  static String transaction(String transactionId) => '/transactions/$transactionId';
  static const String transfers = '/transactions/transfer';

  // Budgets & Goals
  static const String budgets = '/budgets';
  static const String goals = '/goals';
  static String goalDeposit(String goalId) => '/goals/$goalId/deposit';

  // Commercial Invoices
  static const String invoices = '/invoices';
  static String invoice(String invoiceId) => '/invoices/$invoiceId';

  // Accounting & General Ledger
  static const String chartOfAccounts = '/accounting/chart-of-accounts';
  static const String journalEntries = '/accounting/journal-entries';
  static const String trialBalance = '/accounting/trial-balance';

  // Financial Statements & Reports
  static const String profitAndLoss = '/reports/profit-and-loss';
  static const String balanceSheet = '/reports/balance-sheet';
  static const String cashFlow = '/reports/cash-flow';
}
