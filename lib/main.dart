import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'app/routes/app_routes.dart';
import 'core/network/api_client.dart';
import 'features/authentication/presentation/controllers/auth_controller.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Backend REST API client with configured Base URL
  const apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'https://api.finova.internal/v1');
  
  final apiClient = ApiClient(baseUrl: apiBaseUrl);
  Get.put<ApiClient>(apiClient, permanent: true);

  // Register Global Singleton Controllers
  Get.put<AuthController>(AuthController(), permanent: true);

  runApp(const FinovaApp());
}

class FinovaApp extends StatelessWidget {
  const FinovaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'FINOVA',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          secondary: Color(0xFF38BDF8),
          surface: Color(0xFF1E293B),
        ),
      ),
      initialRoute: AppRoutes.dashboard,
    );
  }
}
