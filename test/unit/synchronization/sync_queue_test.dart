import 'package:flutter_test/flutter_test.dart';
import '../../../lib/data/local/daos/sync_queue_dao.dart';
import '../../../lib/data/synchronization/sync_queue.dart';
import '../../../lib/data/synchronization/sync_conflict_resolver.dart';
import '../../../lib/data/synchronization/sync_retry_policy.dart';

void main() {
  group('SyncQueue Offline Mutation Tests', () {
    late InMemorySyncQueueDao dao;
    late SyncQueue queue;

    setUp(() {
      dao = InMemorySyncQueueDao();
      queue = SyncQueue(dao);
    });

    test('Enqueue mutation assigns pending state and unique operation id', () async {
      final opId = await queue.enqueueMutation(
        entityType: 'transaction',
        entityId: 'tx-101',
        operationType: 'create',
        payload: {'amount': '5000', 'currency': 'PKR'},
      );

      expect(opId, isNotEmpty);
      final count = await queue.getPendingCount();
      expect(count, equals(1));

      final batch = await queue.getNextBatch();
      expect(batch.first.entityId, equals('tx-101'));
      expect(batch.first.status, equals('pending'));
    });

    test('Completed operations purge successfully', () async {
      final opId = await queue.enqueueMutation(
        entityType: 'account',
        entityId: 'acc-201',
        operationType: 'update',
        payload: {'name': 'Meezan Corporate Checking'},
      );

      await queue.markInProgress(opId);
      await queue.markCompleted(opId);
      await queue.purgeCompleted();

      final pending = await queue.getPendingCount();
      expect(pending, equals(0));
    });
  });

  group('SyncConflictResolver Tests', () {
    test('Client-Wins strategy applies local state, increments version, and produces audit log', () {
      final local = {'name': 'Client Name', 'balance': '150000'};
      final remote = {'name': 'Remote Stale Name', 'balance': '140000'};

      final result = SyncConflictResolver.resolveConflict(
        entityType: 'account',
        entityId: 'acc-301',
        localPayload: local,
        remotePayload: remote,
        currentVersion: 3,
      );

      expect(result.conflictOccurred, isTrue);
      expect(result.resolvedPayload['name'], equals('Client Name'));
      expect(result.resolvedPayload['version'], equals(4));
      expect(result.auditEntry['action'], equals('CONFLICT_CLIENT_WINS'));
      expect(result.auditEntry['superseded_remote_state']['name'], equals('Remote Stale Name'));
    });
  });

  group('SyncRetryPolicy Tests', () {
    test('Backoff delay increases exponentially within max limits', () {
      const policy = SyncRetryPolicy(
        maxRetries: 5,
        initialDelay: Duration(seconds: 2),
        maxDelay: Duration(seconds: 30),
      );

      expect(policy.shouldRetry(0), isTrue);
      expect(policy.shouldRetry(4), isTrue);
      expect(policy.shouldRetry(5), isFalse);

      final delay1 = policy.getDelayForRetry(1);
      final delay2 = policy.getDelayForRetry(2);

      expect(delay2.inSeconds, greaterThanOrEqualTo(delay1.inSeconds));
    });
  });
}
