import 'package:get/get.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/errors/app_exception.dart';

class UserProfile {
  final String id;
  final String email;
  final String fullName;
  final String preferredCurrency;

  UserProfile({
    required this.id,
    required this.email,
    required this.fullName,
    required this.preferredCurrency,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
    id: json['id'] ?? '',
    email: json['email'] ?? '',
    fullName: json['full_name'] ?? json['name'] ?? 'User',
    preferredCurrency: json['preferred_currency'] ?? 'PKR',
  );
}

class Organization {
  final String id;
  final String name;
  final String slug;
  final String baseCurrency;

  Organization({
    required this.id,
    required this.name,
    required this.slug,
    required this.baseCurrency,
  });

  factory Organization.fromJson(Map<String, dynamic> json) => Organization(
    id: json['id'] ?? '',
    name: json['name'] ?? '',
    slug: json['slug'] ?? '',
    baseCurrency: json['base_currency'] ?? json['baseCurrency'] ?? 'PKR',
  );
}

class AuthController extends GetxController {
  final ApiClient apiClient = Get.find<ApiClient>();

  final Rx<UserProfile?> currentUser = Rx<UserProfile?>(null);
  final Rx<Organization?> activeOrganization = Rx<Organization?>(null);
  final RxString currentUserRole = 'owner'.obs;
  final RxBool isAuthenticated = false.obs;
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _checkInitialSession();
  }

  Future<void> _checkInitialSession() async {
    if (apiClient.isAuthenticated) {
      await fetchCurrentUserProfile();
    } else {
      // Default initial mock controller state for instant dashboard usage
      currentUser.value = UserProfile(
        id: 'usr-101',
        email: 'controller@finova.internal',
        fullName: 'Lead Financial Controller',
        preferredCurrency: 'PKR',
      );
      activeOrganization.value = Organization(
        id: 'org-1',
        name: 'Finova Enterprise Solutions',
        slug: 'finova-enterprise',
        baseCurrency: 'PKR',
      );
      isAuthenticated.value = true;
    }
  }

  Future<void> signIn({required String email, required String password}) async {
    try {
      isLoading.value = true;
      final response = await apiClient.post(
        ApiEndpoints.login,
        data: {'email': email, 'password': password},
      );

      final token = response.data['token'] ?? response.data['access_token'];
      if (token != null) {
        apiClient.setAuthToken(token);
      }

      final userData = response.data['user'] ?? response.data['profile'];
      if (userData != null) {
        currentUser.value = UserProfile.fromJson(userData);
      }

      isAuthenticated.value = true;
      Get.snackbar('Login Successful', 'Welcome back to FINOVA.');
    } on AppException catch (e) {
      Get.snackbar('Authentication Error', e.message);
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signOut() async {
    try {
      if (apiClient.isAuthenticated) {
        await apiClient.post(ApiEndpoints.logout);
      }
    } catch (_) {
      // Graceful local signout regardless of network state
    } finally {
      apiClient.setAuthToken(null);
      currentUser.value = null;
      activeOrganization.value = null;
      isAuthenticated.value = false;
    }
  }

  Future<void> fetchCurrentUserProfile() async {
    try {
      final response = await apiClient.get(ApiEndpoints.profile);
      final data = response.data['data'] ?? response.data;
      currentUser.value = UserProfile.fromJson(data);
      isAuthenticated.value = true;
    } catch (e) {
      // Maintain offline cached state
    }
  }

  void switchOrganization(Organization org) {
    activeOrganization.value = org;
    apiClient.setActiveOrganization(org.id);
  }
}
