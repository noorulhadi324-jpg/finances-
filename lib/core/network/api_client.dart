import 'package:dio/dio.dart';
import '../errors/app_exception.dart';
import 'api_endpoints.dart';

class ApiClient {
  late final Dio _dio;
  String? _authToken;
  String? _activeOrgId;

  ApiClient({String? baseUrl, String? authToken}) {
    _authToken = authToken;
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? ApiEndpoints.defaultBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (_authToken != null && _authToken!.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $_authToken';
          }
          if (_activeOrgId != null) {
            options.headers['X-Organization-Id'] = _activeOrgId;
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) {
          final appException = _handleDioError(error);
          return handler.reject(
            DioException(
              requestOptions: error.requestOptions,
              error: appException,
              type: error.type,
              response: error.response,
            ),
          );
        },
      ),
    );
  }

  void setAuthToken(String? token) {
    _authToken = token;
  }

  void setActiveOrganization(String? orgId) {
    _activeOrgId = orgId;
  }

  bool get isAuthenticated => _authToken != null && _authToken!.isNotEmpty;

  // GET
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.get<T>(path, queryParameters: queryParameters, options: options);
    } on DioException catch (e) {
      throw e.error as AppException;
    }
  }

  // POST
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.post<T>(path, data: data, queryParameters: queryParameters, options: options);
    } on DioException catch (e) {
      throw e.error as AppException;
    }
  }

  // PUT
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.put<T>(path, data: data, queryParameters: queryParameters, options: options);
    } on DioException catch (e) {
      throw e.error as AppException;
    }
  }

  // DELETE
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.delete<T>(path, data: data, queryParameters: queryParameters, options: options);
    } on DioException catch (e) {
      throw e.error as AppException;
    }
  }

  AppException _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return const NetworkException('Connection to backend server timed out. Please check your internet.');
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final message = error.response?.data?['message'] ?? error.message ?? 'Server error occurred.';
        if (statusCode == 401) {
          return AuthException(message, code: 'UNAUTHORIZED');
        } else if (statusCode == 403) {
          return AuthException(message, code: 'FORBIDDEN');
        } else if (statusCode == 422 || statusCode == 400) {
          return ValidationException(message, code: 'VALIDATION_FAILED');
        }
        return AppException('Backend Error ($statusCode): $message', code: 'SERVER_ERROR');
      case DioExceptionType.cancel:
        return const AppException('Request to backend server was cancelled.');
      default:
        return AppException(error.message ?? 'Unexpected network error occurred.');
    }
  }
}
