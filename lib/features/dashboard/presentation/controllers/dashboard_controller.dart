import 'package:get/get.dart';
import 'package:decimal/decimal.dart';
import '../../../../core/network/api_client.dart';
import '../../../../data/remote/api_remote_data_source.dart';
import '../../../authentication/presentation/controllers/auth_controller.dart';
import '../../../accounts/presentation/controllers/account_controller.dart';
import '../../../transactions/presentation/controllers/transaction_controller.dart';

class DashboardController extends GetxController {
  final ApiRemoteDataSource _remoteDataSource = ApiRemoteDataSource(Get.find<ApiClient>());
  final AuthController authController = Get.find<AuthController>();

  final Rx<Decimal> netWorth = Decimal.zero.obs;
  final Rx<Decimal> totalInflow = Decimal.zero.obs;
  final Rx<Decimal> totalOutflow = Decimal.zero.obs;
  final Rx<Decimal> netCashFlow = Decimal.zero.obs;
  final RxInt savingsRate = 0.obs;
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadDashboardMetrics();
  }

  Future<void> loadDashboardMetrics() async {
    final org = authController.activeOrganization.value;
    if (org == null) return;

    try {
      isLoading.value = true;

      // Ensure accounts and transactions are loaded
      if (Get.isRegistered<AccountController>()) {
        await Get.find<AccountController>().fetchAccounts();
      }
      if (Get.isRegistered<TransactionController>()) {
        await Get.find<TransactionController>().fetchTransactions();
      }

      // Recompute reactive aggregates
      _computeAggregates();
    } catch (_) {
      _computeAggregates();
    } finally {
      isLoading.value = false;
    }
  }

  void _computeAggregates() {
    if (!Get.isRegistered<AccountController>() || !Get.isRegistered<TransactionController>()) return;

    final accountCtrl = Get.find<AccountController>();
    final txCtrl = Get.find<TransactionController>();

    // Net worth from accounts
    Decimal assets = Decimal.zero;
    Decimal liabilities = Decimal.zero;

    for (final acc in accountCtrl.accounts) {
      if (acc.type == 'credit_card' || acc.balance < Decimal.zero) {
        liabilities += acc.balance.abs();
      } else {
        assets += acc.balance;
      }
    }
    netWorth.value = assets - liabilities;

    // Inflow vs Outflow
    Decimal income = Decimal.zero;
    Decimal expense = Decimal.zero;

    for (final tx in txCtrl.transactions) {
      if (tx.type == 'income') {
        income += tx.amount;
      } else if (tx.type == 'expense') {
        expense += tx.amount;
      }
    }

    totalInflow.value = income;
    totalOutflow.value = expense;
    netCashFlow.value = income - expense;

    if (income > Decimal.zero) {
      final rate = ((income - expense) / income).toDecimal(scaleOnInfinitePrecision: 2).toDouble() * 100;
      savingsRate.value = rate.clamp(0, 100).toInt();
    } else {
      savingsRate.value = 0;
    }
  }
}
