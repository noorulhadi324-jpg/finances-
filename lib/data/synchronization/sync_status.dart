enum SyncState {
  idle,
  syncing,
  success,
  error,
  offline,
}

class SyncProgress {
  final SyncState state;
  final int pendingCount;
  final int completedCount;
  final String? lastError;
  final DateTime? lastSyncTime;

  const SyncProgress({
    this.state = SyncState.idle,
    this.pendingCount = 0,
    this.completedCount = 0,
    this.lastError,
    this.lastSyncTime,
  });

  SyncProgress copyWith({
    SyncState? state,
    int? pendingCount,
    int? completedCount,
    String? lastError,
    DateTime? lastSyncTime,
  }) {
    return SyncProgress(
      state: state ?? this.state,
      pendingCount: pendingCount ?? this.pendingCount,
      completedCount: completedCount ?? this.completedCount,
      lastError: lastError ?? this.lastError,
      lastSyncTime: lastSyncTime ?? this.lastSyncTime,
    );
  }
}
