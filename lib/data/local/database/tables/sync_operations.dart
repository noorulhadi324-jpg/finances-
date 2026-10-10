import 'package:drift/drift.dart';

@DataClassName('SyncOperationRecord')
class SyncOperations extends Table {
  TextColumn get id => text()();
  TextColumn get entityType => text()(); // 'account', 'transaction', 'category', 'budget', 'goal', 'invoice'
  TextColumn get entityId => text()();
  TextColumn get operationType => text()(); // 'create', 'update', 'delete'
  TextColumn get payloadJson => text()();
  DateTimeColumn get createdAt => dateTime()();
  TextColumn get status => text().withDefault(const Constant('pending'))(); // 'pending', 'in_progress', 'synced', 'failed'
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  TextColumn get errorMessage => text().nullable()();
  IntColumn get version => integer().withDefault(const Constant(1))();

  @override
  Set<Column> get primaryKey => {id};
}
