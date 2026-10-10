import 'package:drift/drift.dart';

@DataClassName('LocalAccountRecord')
class LocalAccounts extends Table {
  TextColumn get id => text()();
  TextColumn get orgId => text()();
  TextColumn get name => text()();
  TextColumn get type => text()(); // bank, cash, savings, credit_card, digital_wallet
  TextColumn get institutionName => text().nullable()();
  TextColumn get accountNumberMask => text().nullable()();
  TextColumn get currency => text().withDefault(const Constant('PKR'))();
  TextColumn get balance => text().withDefault(const Constant('0.0000'))(); // Decimal string for zero-loss float
  TextColumn get initialBalance => text().withDefault(const Constant('0.0000'))();
  TextColumn get colorHex => text().withDefault(const Constant('#059669'))();
  BoolColumn get isArchived => boolean().withDefault(const Constant(false))();
  DateTimeColumn get updatedAt => dateTime()();
  TextColumn get syncStatus => text().withDefault(const Constant('synced'))(); // synced, pending_sync

  @override
  Set<Column> get primaryKey => {id};
}
