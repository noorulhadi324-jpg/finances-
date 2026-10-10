import 'dart:convert';
import '../database/tables/sync_operations.dart';

class SyncQueueItem {
  final String id;
  final String entityType;
  final String entityId;
  final String operationType;
  final Map<String, dynamic> payload;
  final DateTime createdAt;
  final String status;
  final int retryCount;
  final String? errorMessage;
  final int version;

  SyncQueueItem({
    required this.id,
    required this.entityType,
    required this.entityId,
    required this.operationType,
    required this.payload,
    required this.createdAt,
    this.status = 'pending',
    this.retryCount = 0,
    this.errorMessage,
    this.version = 1,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'entityType': entityType,
    'entityId': entityId,
    'operationType': operationType,
    'payloadJson': jsonEncode(payload),
    'createdAt': createdAt.toIso8601String(),
    'status': status,
    'retryCount': retryCount,
    'errorMessage': errorMessage,
    'version': version,
  };

  factory SyncQueueItem.fromMap(Map<String, dynamic> map) => SyncQueueItem(
    id: map['id'],
    entityType: map['entityType'],
    entityId: map['entityId'],
    operationType: map['operationType'],
    payload: jsonDecode(map['payloadJson']),
    createdAt: DateTime.parse(map['createdAt']),
    status: map['status'] ?? 'pending',
    retryCount: map['retryCount'] ?? 0,
    errorMessage: map['errorMessage'],
    version: map['version'] ?? 1,
  );
}

abstract class ISyncQueueDao {
  Future<void> enqueue(SyncQueueItem item);
  Future<List<SyncQueueItem>> getPendingOperations({int limit = 50});
  Future<void> markOperationInProgress(String id);
  Future<void> markOperationSynced(String id);
  Future<void> markOperationFailed(String id, String errorMessage, int retryCount);
  Future<int> getPendingCount();
  Future<void> clearSyncedOperations();
}

class InMemorySyncQueueDao implements ISyncQueueDao {
  final List<SyncQueueItem> _queue = [];

  @override
  Future<void> enqueue(SyncQueueItem item) async {
    _queue.add(item);
  }

  @override
  Future<List<SyncQueueItem>> getPendingOperations({int limit = 50}) async {
    return _queue.where((i) => i.status == 'pending' || i.status == 'failed').take(limit).toList();
  }

  @override
  Future<void> markOperationInProgress(String id) async {
    final idx = _queue.indexWhere((i) => i.id == id);
    if (idx != -1) {
      final old = _queue[idx];
      _queue[idx] = SyncQueueItem(
        id: old.id,
        entityType: old.entityType,
        entityId: old.entityId,
        operationType: old.operationType,
        payload: old.payload,
        createdAt: old.createdAt,
        status: 'in_progress',
        retryCount: old.retryCount,
        version: old.version,
      );
    }
  }

  @override
  Future<void> markOperationSynced(String id) async {
    final idx = _queue.indexWhere((i) => i.id == id);
    if (idx != -1) {
      final old = _queue[idx];
      _queue[idx] = SyncQueueItem(
        id: old.id,
        entityType: old.entityType,
        entityId: old.entityId,
        operationType: old.operationType,
        payload: old.payload,
        createdAt: old.createdAt,
        status: 'synced',
        retryCount: old.retryCount,
        version: old.version,
      );
    }
  }

  @override
  Future<void> markOperationFailed(String id, String errorMessage, int retryCount) async {
    final idx = _queue.indexWhere((i) => i.id == id);
    if (idx != -1) {
      final old = _queue[idx];
      _queue[idx] = SyncQueueItem(
        id: old.id,
        entityType: old.entityType,
        entityId: old.entityId,
        operationType: old.operationType,
        payload: old.payload,
        createdAt: old.createdAt,
        status: 'failed',
        retryCount: retryCount,
        errorMessage: errorMessage,
        version: old.version,
      );
    }
  }

  @override
  Future<int> getPendingCount() async {
    return _queue.where((i) => i.status == 'pending' || i.status == 'in_progress').length;
  }

  @override
  Future<void> clearSyncedOperations() async {
    _queue.removeWhere((i) => i.status == 'synced');
  }
}
