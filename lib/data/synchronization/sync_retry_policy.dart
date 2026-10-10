import 'dart:math';

class SyncRetryPolicy {
  final int maxRetries;
  final Duration initialDelay;
  final Duration maxDelay;
  final double backoffMultiplier;

  const SyncRetryPolicy({
    this.maxRetries = 5,
    this.initialDelay = const Duration(seconds: 2),
    this.maxDelay = const Duration(minutes: 5),
    this.backoffMultiplier = 2.0,
  });

  bool shouldRetry(int currentRetryCount) => currentRetryCount < maxRetries;

  Duration getDelayForRetry(int currentRetryCount) {
    if (currentRetryCount <= 0) return Duration.zero;

    final exponentialSeconds = initialDelay.inSeconds * pow(backoffMultiplier, currentRetryCount - 1);
    final clampedSeconds = min(exponentialSeconds.toDouble(), maxDelay.inSeconds.toDouble());
    
    // Add 10% jitter to prevent thundering herd
    final jitter = (Random().nextDouble() * 0.2 - 0.1) * clampedSeconds;
    final finalSeconds = (clampedSeconds + jitter).toInt();

    return Duration(seconds: max(1, finalSeconds));
  }
}
