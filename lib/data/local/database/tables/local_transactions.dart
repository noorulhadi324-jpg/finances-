import 'package:drift/drift.dart';

@DataClassName('LocalTransactionRecord')
class LocalTransactions extends Table {
  TextColumn get id => text()();
  TextColumn get orgId => text()();
  TextColumn get accountId => text()();
  TextColumn get destinationAccountId => text().nullable()();
  TextColumn get categoryId => text().nullable()();
  TextColumn get type => text()(); // income, expense, transfer
  TextColumn get amount => text()(); // Decimal string
  TextColumn get currency => text().withDefault(const Constant('PKR'))();
  TextColumn get exchangeRate => text().withDefault(const Constant('1.000000'))();
  TextColumn get baseCurrencyAmount => text()();
  DateTimeColumn get transactionDate => dateTime()();
  TextColumn get payeeOrPayer => text().nullable()();
  TextColumn get referenceNumber => text().nullable()();
  TextColumn get notes => text().nullable()();
  TextColumn get status => text().withDefault(const Constant('cleared'))(); // pending, cleared, reconciled, void
  TextColumn get receiptUrl => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  TextColumn get syncStatus => text().withDefault(const Constant('synced'))();

  @override
  Set<Column> get primaryKey => {id};
}
