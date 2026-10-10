import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../features/authentication/presentation/controllers/auth_controller.dart';
import '../../app/routes/app_routes.dart';

/// Finova AuthMiddleware
/// Enforces authenticated session check, active tenant/organization selection,
/// and Role-Based Access Control (RBAC) prior to route resolution.
class FinovaAuthMiddleware extends GetMiddleware {
  final List<String>? requiredRoles;

  FinovaAuthMiddleware({this.requiredRoles, int? priority}) 
      : super(priority: priority ?? 1);

  @override
  RouteSettings? redirect(String? route) {
    // 1. Ensure AuthController is available
    if (!Get.isRegistered<AuthController>()) {
      return const RouteSettings(name: AppRoutes.login);
    }

    final authController = Get.find<AuthController>();

    // 2. Unauthenticated check
    if (!authController.isAuthenticated.value) {
      return const RouteSettings(name: AppRoutes.login);
    }

    // 3. Organization check (Tenant isolation)
    if (authController.activeOrganization.value == null && 
        route != AppRoutes.selectOrganization) {
      return const RouteSettings(name: AppRoutes.selectOrganization);
    }

    // 4. Role-Based Access Control (RBAC) authorization
    if (requiredRoles != null && requiredRoles!.isNotEmpty) {
      final userRole = authController.currentUserRole.value;
      if (!requiredRoles!.contains(userRole)) {
        Get.snackbar(
          'Access Denied',
          'Your account role ($userRole) lacks clearance for this section.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.shade900,
          colorText: Colors.white,
        );
        return const RouteSettings(name: AppRoutes.dashboard);
      }
    }

    // Clearance granted
    return null;
  }
}
