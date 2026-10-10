import 'dart:async';
import 'package:uuid/uuid.dart';
import '../local/daos/sync_queue_dao.dart';

class SyncQueue {
  final ISyncQueueDao _dao;
  final _uuid = const Uuid();

  SyncQueue(this._dao);

  Future<String> enqueueMutation({
    required String entityType,
    required String entityId,
    required String operationType, // 'create', 'update', 'delete'
    required Map<String, dynamic> payload,
    int version = 1,
  }) async {
    final operationId = _uuid.v4();
    final item = SyncQueueItem(
      id: operationId,
      entityType: entityType,
      entityId: entityId,
      operationType: operationType,
      payload: payload,
      createdAt: DateTime.now(),
      status: 'pending',
      retryCount: 0,
      version: version,
    );

    await _dao.enqueue(item);
    return operationId;
  }

  Future<List<SyncQueueItem>> getNextBatch({int limit = 50}) =>
      _dao.getPendingOperations(limit: limit);

  Future<void> markInProgress(String id) => _dao.markOperationInProgress(id);

  Future<void> markCompleted(String id) => _dao.markOperationSynced(id);

  Future<void> markFailed(String id, String error, int retries) =>
      _dao.markOperationFailed(id, error, retries);

  Future<int> getPendingCount() => _dao.getPendingCount();

  Future<void> purgeCompleted() => _dao.clearSyncedOperations();
}
