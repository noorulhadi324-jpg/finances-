import 'dart:async';
import '../../core/network/network_status.dart';
import '../../core/network/api_client.dart';
import 'sync_queue.dart';
import 'sync_status.dart';
import 'sync_retry_policy.dart';

class SyncService {
  final SyncQueue _syncQueue;
  final IConnectivityService _connectivity;
  final ApiClient _apiClient;
  final SyncRetryPolicy _retryPolicy;

  final _progressController = StreamController<SyncProgress>.broadcast();
  SyncProgress _currentProgress = const SyncProgress();
  Timer? _periodicTimer;
  bool _isProcessing = false;

  SyncService({
    required SyncQueue syncQueue,
    required IConnectivityService connectivity,
    required ApiClient apiClient,
    SyncRetryPolicy? retryPolicy,
  })  : _syncQueue = syncQueue,
        _connectivity = connectivity,
        _apiClient = apiClient,
        _retryPolicy = retryPolicy ?? const SyncRetryPolicy() {
    _initListeners();
  }

  Stream<SyncProgress> get progressStream => _progressController.stream;
  SyncProgress get currentProgress => _currentProgress;

  void _initListeners() {
    _connectivity.onStatusChanged.listen((status) {
      if (status == NetworkStatus.online) {
        processQueue();
      } else {
        _updateProgress(_currentProgress.copyWith(state: SyncState.offline));
      }
    });

    // Periodic sweep every 5 minutes
    _periodicTimer = Timer.periodic(const Duration(minutes: 5), (_) => processQueue());
  }

  Future<void> processQueue() async {
    if (_isProcessing) return;

    final isOnline = await _connectivity.isConnected;
    if (!isOnline) {
      _updateProgress(_currentProgress.copyWith(state: SyncState.offline));
      return;
    }

    _isProcessing = true;
    _updateProgress(_currentProgress.copyWith(state: SyncState.syncing));

    try {
      final pendingCount = await _syncQueue.getPendingCount();
      if (pendingCount == 0) {
        _updateProgress(_currentProgress.copyWith(
          state: SyncState.idle,
          pendingCount: 0,
          lastSyncTime: DateTime.now(),
        ));
        _isProcessing = false;
        return;
      }

      final batch = await _syncQueue.getNextBatch();
      int successCount = 0;

      for (final op in batch) {
        try {
          await _syncQueue.markInProgress(op.id);
          await _executeRemoteOperation(op.entityType, op.operationType, op.payload);
          await _syncQueue.markCompleted(op.id);
          successCount++;
        } catch (e) {
          final nextRetry = op.retryCount + 1;
          await _syncQueue.markFailed(op.id, e.toString(), nextRetry);
        }
      }

      await _syncQueue.purgeCompleted();
      final remaining = await _syncQueue.getPendingCount();

      _updateProgress(_currentProgress.copyWith(
        state: remaining == 0 ? SyncState.success : SyncState.error,
        pendingCount: remaining,
        completedCount: _currentProgress.completedCount + successCount,
        lastSyncTime: DateTime.now(),
      ));
    } catch (err) {
      _updateProgress(_currentProgress.copyWith(
        state: SyncState.error,
        lastError: err.toString(),
      ));
    } finally {
      _isProcessing = false;
    }
  }

  Future<void> _executeRemoteOperation(
    String entityType,
    String operationType,
    Map<String, dynamic> payload,
  ) async {
    final endpoint = '/$entityType';

    switch (operationType) {
      case 'create':
        await _apiClient.post(endpoint, data: payload);
        break;
      case 'update':
        final id = payload['id'];
        await _apiClient.put('$endpoint/$id', data: payload);
        break;
      case 'delete':
        final id = payload['id'];
        await _apiClient.delete('$endpoint/$id');
        break;
    }
  }

  void _updateProgress(SyncProgress progress) {
    _currentProgress = progress;
    _progressController.add(progress);
  }

  void dispose() {
    _periodicTimer?.cancel();
    _progressController.close();
  }
}
