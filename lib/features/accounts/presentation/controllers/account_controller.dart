import 'package:get/get.dart';
import 'package:decimal/decimal.dart';
import '../../../../core/network/api_client.dart';
import '../../../../data/remote/api_remote_data_source.dart';
import '../../../../data/local/daos/account_dao.dart';
import '../../../authentication/presentation/controllers/auth_controller.dart';

class AccountController extends GetxController {
  final ApiRemoteDataSource _remoteDataSource = ApiRemoteDataSource(Get.find<ApiClient>());
  final AuthController _authController = Get.find<AuthController>();

  final RxList<LocalAccountModel> accounts = <LocalAccountModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxString error = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchAccounts();
  }

  Future<void> fetchAccounts() async {
    final org = _authController.activeOrganization.value;
    if (org == null) return;

    try {
      isLoading.value = true;
      error.value = '';

      final remoteList = await _remoteDataSource.fetchAccounts(org.id);
      accounts.value = remoteList.map((map) => LocalAccountModel.fromMap(map)).toList();
    } catch (e) {
      error.value = e.toString();
      // Graceful offline fallback / demo initialization
      if (accounts.isEmpty) {
        accounts.value = [
          LocalAccountModel(
            id: 'acc-1',
            orgId: org.id,
            name: 'Meezan Corporate Checking',
            type: 'bank',
            institutionName: 'Meezan Bank Ltd',
            accountNumberMask: '•••• 4920',
            currency: 'PKR',
            balance: Decimal.parse('2450000'),
            initialBalance: Decimal.parse('1500000'),
            colorHex: '#059669',
            updatedAt: DateTime.now(),
          ),
          LocalAccountModel(
            id: 'acc-2',
            orgId: org.id,
            name: 'Standard Chartered USD Reserve',
            type: 'savings',
            institutionName: 'Standard Chartered',
            accountNumberMask: '•••• 8821',
            currency: 'USD',
            balance: Decimal.parse('18500'),
            initialBalance: Decimal.parse('12000'),
            colorHex: '#2563eb',
            updatedAt: DateTime.now(),
          ),
        ];
      }
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> createAccount({
    required String name,
    required String type,
    required String currency,
    required Decimal initialBalance,
    String? institutionName,
    String? accountNumberMask,
    String colorHex = '#059669',
  }) async {
    final org = _authController.activeOrganization.value;
    if (org == null) return;

    try {
      isLoading.value = true;
      final payload = {
        'organizationId': org.id,
        'name': name,
        'type': type,
        'currency': currency,
        'initialBalance': initialBalance.toString(),
        'balance': initialBalance.toString(),
        'institutionName': institutionName,
        'accountNumberMask': accountNumberMask,
        'colorHex': colorHex,
      };

      final response = await _remoteDataSource.createAccount(payload);
      final newAccount = LocalAccountModel.fromMap(response);
      accounts.add(newAccount);

      Get.snackbar('Account Created', '${newAccount.name} created successfully.');
    } catch (e) {
      Get.snackbar('Creation Failed', e.toString());
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }

  Decimal get totalLiquidAssets {
    return accounts.where((a) => a.balance > Decimal.zero && a.type != 'credit_card')
        .fold(Decimal.zero, (sum, a) => sum + a.balance);
  }
}
