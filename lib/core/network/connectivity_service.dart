import 'dart:async';
import 'network_status.dart';

class ConnectivityService implements IConnectivityService {
  final _statusController = StreamController<NetworkStatus>.broadcast();
  bool _isOnline = true;

  ConnectivityService() {
    // Initial state
    _statusController.add(NetworkStatus.online);
  }

  @override
  Future<bool> get isConnected async => _isOnline;

  @override
  Stream<NetworkStatus> get onStatusChanged => _statusController.stream;

  void updateConnectionStatus(bool online) {
    if (_isOnline != online) {
      _isOnline = online;
      _statusController.add(online ? NetworkStatus.online : NetworkStatus.offline);
    }
  }

  void dispose() {
    _statusController.close();
  }
}
