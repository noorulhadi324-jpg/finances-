import 'package:drift/drift.dart';

@DataClassName('LocalCategoryRecord')
class LocalCategories extends Table {
  TextColumn get id => text()();
  TextColumn get orgId => text()();
  TextColumn get name => text()();
  TextColumn get type => text()(); // income, expense, transfer
  TextColumn get icon => text().withDefault(const Constant('tag'))();
  TextColumn get colorHex => text().withDefault(const Constant('#10b981'))();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('LocalBudgetRecord')
class LocalBudgets extends Table {
  TextColumn get id => text()();
  TextColumn get orgId => text()();
  TextColumn get name => text()();
  TextColumn get categoryId => text()();
  TextColumn get allocatedAmount => text()();
  TextColumn get period => text().withDefault(const Constant('monthly'))();
  RealColumn get warningThresholdPct => real().withDefault(const Constant(80.0))();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('LocalGoalRecord')
class LocalGoals extends Table {
  TextColumn get id => text()();
  TextColumn get orgId => text()();
  TextColumn get name => text()();
  TextColumn get targetAmount => text()();
  TextColumn get currentAmount => text().withDefault(const Constant('0.0000'))();
  DateTimeColumn get targetDate => dateTime()();
  TextColumn get categoryTag => text().withDefault(const Constant('General'))();
  BoolColumn get isCompleted => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('LocalInvoiceRecord')
class LocalInvoices extends Table {
  TextColumn get id => text()();
  TextColumn get orgId => text()();
  TextColumn get invoiceNumber => text()();
  TextColumn get clientName => text()();
  TextColumn get clientEmail => text().nullable()();
  DateTimeColumn get issueDate => dateTime()();
  DateTimeColumn get dueDate => dateTime()();
  TextColumn get currency => text().withDefault(const Constant('PKR'))();
  TextColumn get totalAmount => text()();
  TextColumn get amountPaid => text().withDefault(const Constant('0.0000'))();
  TextColumn get status => text().withDefault(const Constant('draft'))();
  TextColumn get itemsJson => text()();

  @override
  Set<Column> get primaryKey => {id};
}
