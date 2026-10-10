class DatabaseConstants {
  static const String databaseName = 'finova_local.db';
  static const int databaseVersion = 1;

  // Table Names
  static const String accountsTable = 'local_accounts';
  static const String transactionsTable = 'local_transactions';
  static const String categoriesTable = 'local_categories';
  static const String budgetsTable = 'local_budgets';
  static const String goalsTable = 'local_goals';
  static const String invoicesTable = 'local_invoices';
  static const String syncOperationsTable = 'sync_operations';
  static const String auditLogsTable = 'local_audit_logs';

  // Remote Supabase Endpoints / Tables
  static const String remoteAccounts = 'accounts';
  static const String remoteTransactions = 'transactions';
  static const String remoteCategories = 'transaction_categories';
  static const String remoteBudgets = 'budgets';
  static const String remoteGoals = 'financial_goals';
  static const String remoteInvoices = 'invoices';
  static const String remoteJournalEntries = 'journal_entries';
  static const String remoteAuditLogs = 'audit_logs';
}
