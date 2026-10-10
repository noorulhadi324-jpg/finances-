class ConflictResolutionResult {
  final Map<String, dynamic> resolvedPayload;
  final bool conflictOccurred;
  final Map<String, dynamic> auditEntry;

  const ConflictResolutionResult({
    required this.resolvedPayload,
    required this.conflictOccurred,
    required this.auditEntry,
  });
}

class SyncConflictResolver {
  /// Strategy: Client-Wins with Immutable Audit Versioning
  /// Local client mutation takes precedence while recording remote state in audit log.
  static ConflictResolutionResult resolveConflict({
    required String entityType,
    required String entityId,
    required Map<String, dynamic> localPayload,
    required Map<String, dynamic> remotePayload,
    required int currentVersion,
  }) {
    final nextVersion = currentVersion + 1;
    final resolvedPayload = Map<String, dynamic>.from(localPayload);
    resolvedPayload['version'] = nextVersion;
    resolvedPayload['updated_at'] = DateTime.now().toIso8601String();

    final auditEntry = {
      'entity_type': entityType,
      'entity_id': entityId,
      'action': 'CONFLICT_CLIENT_WINS',
      'superseded_remote_state': remotePayload,
      'applied_local_state': localPayload,
      'version': nextVersion,
      'resolved_at': DateTime.now().toIso8601String(),
    };

    return ConflictResolutionResult(
      resolvedPayload: resolvedPayload,
      conflictOccurred: true,
      auditEntry: auditEntry,
    );
  }
}
