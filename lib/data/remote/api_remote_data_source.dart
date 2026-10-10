import '../../core/network/api_client.dart';
import '../../core/network/api_endpoints.dart';
import '../../core/errors/app_exception.dart';

abstract class IRemoteDataSource {
  Future<List<Map<String, dynamic>>> fetchAccounts(String orgId);
  Future<List<Map<String, dynamic>>> fetchTransactions(String orgId, {int limit = 50, int offset = 0});
  Future<Map<String, dynamic>> createTransaction(Map<String, dynamic> data);
  Future<Map<String, dynamic>> createAccount(Map<String, dynamic> data);
  Future<Map<String, dynamic>> executeTransfer(Map<String, dynamic> data);
  Future<List<Map<String, dynamic>>> fetchBudgets(String orgId);
  Future<List<Map<String, dynamic>>> fetchInvoices(String orgId);
  Future<Map<String, dynamic>> fetchDashboardSummary(String orgId);
}

class ApiRemoteDataSource implements IRemoteDataSource {
  final ApiClient _client;

  ApiRemoteDataSource(this._client);

  @override
  Future<List<Map<String, dynamic>>> fetchAccounts(String orgId) async {
    final response = await _client.get(
      ApiEndpoints.accounts,
      queryParameters: {'organizationId': orgId},
    );
    final data = response.data;
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    }
    return List<Map<String, dynamic>>.from(data['data'] ?? []);
  }

  @override
  Future<List<Map<String, dynamic>>> fetchTransactions(String orgId, {int limit = 50, int offset = 0}) async {
    final response = await _client.get(
      ApiEndpoints.transactions,
      queryParameters: {
        'organizationId': orgId,
        'limit': limit,
        'offset': offset,
      },
    );
    final data = response.data;
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    }
    return List<Map<String, dynamic>>.from(data['data'] ?? []);
  }

  @override
  Future<Map<String, dynamic>> createTransaction(Map<String, dynamic> data) async {
    final response = await _client.post(ApiEndpoints.transactions, data: data);
    return Map<String, dynamic>.from(response.data['data'] ?? response.data);
  }

  @override
  Future<Map<String, dynamic>> createAccount(Map<String, dynamic> data) async {
    final response = await _client.post(ApiEndpoints.accounts, data: data);
    return Map<String, dynamic>.from(response.data['data'] ?? response.data);
  }

  @override
  Future<Map<String, dynamic>> executeTransfer(Map<String, dynamic> data) async {
    final response = await _client.post(ApiEndpoints.transfers, data: data);
    return Map<String, dynamic>.from(response.data['data'] ?? response.data);
  }

  @override
  Future<List<Map<String, dynamic>>> fetchBudgets(String orgId) async {
    final response = await _client.get(
      ApiEndpoints.budgets,
      queryParameters: {'organizationId': orgId},
    );
    final data = response.data;
    if (data is List) return List<Map<String, dynamic>>.from(data);
    return List<Map<String, dynamic>>.from(data['data'] ?? []);
  }

  @override
  Future<List<Map<String, dynamic>>> fetchInvoices(String orgId) async {
    final response = await _client.get(
      ApiEndpoints.invoices,
      queryParameters: {'organizationId': orgId},
    );
    final data = response.data;
    if (data is List) return List<Map<String, dynamic>>.from(data);
    return List<Map<String, dynamic>>.from(data['data'] ?? []);
  }

  @override
  Future<Map<String, dynamic>> fetchDashboardSummary(String orgId) async {
    final response = await _client.get(
      '/dashboard/summary',
      queryParameters: {'organizationId': orgId},
    );
    return Map<String, dynamic>.from(response.data['data'] ?? response.data);
  }
}
