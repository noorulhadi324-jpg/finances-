import 'package:drift/drift.dart';
import 'tables/local_accounts.dart';
import 'tables/local_transactions.dart';
import 'tables/local_categories.dart';
import 'tables/sync_operations.dart';

export 'tables/local_accounts.dart';
export 'tables/local_transactions.dart';
export 'tables/local_categories.dart';
export 'tables/sync_operations.dart';

@DriftDatabase(tables: [
  LocalAccounts,
  LocalTransactions,
  LocalCategories,
  LocalBudgets,
  LocalGoals,
  LocalInvoices,
  SyncOperations,
])
class AppDatabase {
  // Schema version management
  int get schemaVersion => 1;
}
