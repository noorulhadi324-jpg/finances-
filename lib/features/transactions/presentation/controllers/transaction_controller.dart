import 'package:get/get.dart';
import 'package:decimal/decimal.dart';
import '../../../../core/network/api_client.dart';
import '../../../../data/remote/api_remote_data_source.dart';
import '../../../../data/local/daos/transaction_dao.dart';
import '../../../authentication/presentation/controllers/auth_controller.dart';
import '../../accounts/presentation/controllers/account_controller.dart';

class TransactionController extends GetxController {
  final ApiRemoteDataSource _remoteDataSource = ApiRemoteDataSource(Get.find<ApiClient>());
  final AuthController _authController = Get.find<AuthController>();

  final RxList<LocalTransactionModel> transactions = <LocalTransactionModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxString error = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchTransactions();
  }

  Future<void> fetchTransactions() async {
    final org = _authController.activeOrganization.value;
    if (org == null) return;

    try {
      isLoading.value = true;
      error.value = '';

      final remoteList = await _remoteDataSource.fetchTransactions(org.id);
      transactions.value = remoteList.map((map) => LocalTransactionModel.fromMap(map)).toList();
    } catch (e) {
      error.value = e.toString();
      // Graceful demo seed fallback
      if (transactions.isEmpty) {
        transactions.value = [
          LocalTransactionModel(
            id: 'tx-1',
            orgId: org.id,
            accountId: 'acc-1',
            type: 'income',
            amount: Decimal.parse('650000'),
            currency: 'PKR',
            baseCurrencyAmount: Decimal.parse('650000'),
            transactionDate: DateTime.now().subtract(const Duration(days: 1)),
            payeeOrPayer: 'Fintech Enterprise Client',
            notes: 'Q4 Milestone 2 Retainer Settlement',
            createdAt: DateTime.now(),
          ),
          LocalTransactionModel(
            id: 'tx-2',
            orgId: org.id,
            accountId: 'acc-1',
            type: 'expense',
            amount: Decimal.parse('95000'),
            currency: 'PKR',
            baseCurrencyAmount: Decimal.parse('95000'),
            transactionDate: DateTime.now().subtract(const Duration(days: 3)),
            payeeOrPayer: 'Cloud Infrastructure Provider',
            notes: 'Database & Kubernetes Cluster Hosting',
            createdAt: DateTime.now(),
          ),
        ];
      }
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> recordTransaction({
    required String accountId,
    String? destinationAccountId,
    String? categoryId,
    required String type, // income, expense, transfer
    required Decimal amount,
    String currency = 'PKR',
    required String payeeOrPayer,
    String? referenceNumber,
    String? notes,
    DateTime? date,
  }) async {
    final org = _authController.activeOrganization.value;
    if (org == null) return;

    try {
      isLoading.value = true;
      final payload = {
        'organizationId': org.id,
        'accountId': accountId,
        'destinationAccountId': destinationAccountId,
        'categoryId': categoryId,
        'type': type,
        'amount': amount.toString(),
        'currency': currency,
        'baseCurrencyAmount': amount.toString(),
        'payeeOrPayer': payeeOrPayer,
        'referenceNumber': referenceNumber,
        'notes': notes,
        'transactionDate': (date ?? DateTime.now()).toIso8601String(),
      };

      Map<String, dynamic> response;
      if (type == 'transfer') {
        response = await _remoteDataSource.executeTransfer(payload);
      } else {
        response = await _remoteDataSource.createTransaction(payload);
      }

      final newTx = LocalTransactionModel.fromMap(response);
      transactions.insert(0, newTx);

      // Refresh accounts list to reflect updated balances
      if (Get.isRegistered<AccountController>()) {
        Get.find<AccountController>().fetchAccounts();
      }

      Get.snackbar('Recorded', 'Transaction posted successfully to backend.');
    } catch (e) {
      Get.snackbar('Transaction Failed', e.toString());
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }
}
