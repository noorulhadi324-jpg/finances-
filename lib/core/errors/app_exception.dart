class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  const AppException(this.message, {this.code, this.details});

  @override
  String toString() => 'AppException(code: $code, message: $message)';
}

class DatabaseException extends AppException {
  const DatabaseException(super.message, {super.code, super.details});
}

class SyncException extends AppException {
  const SyncException(super.message, {super.code, super.details});
}

class NetworkException extends AppException {
  const NetworkException(super.message, {super.code, super.details});
}

class AuthException extends AppException {
  const AuthException(super.message, {super.code, super.details});
}

class ValidationException extends AppException {
  const ValidationException(super.message, {super.code, super.details});
}
