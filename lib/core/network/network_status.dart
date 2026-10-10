enum NetworkStatus {
  online,
  offline,
}

abstract class IConnectivityService {
  Future<bool> get isConnected;
  Stream<NetworkStatus> get onStatusChanged;
}
