import React, { useState } from 'react';
import {
  Layers,
  Code2,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Database,
  Cpu,
  FileCode,
  FolderTree,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeFileKey, setActiveFileKey] = useState<string>('api_client');

  const filesMap: Record<string, { title: string; lang: string; path: string; code: string }> = {
    api_client: {
      title: 'Backend REST ApiClient (Dio & Bearer Auth)',
      lang: 'dart',
      path: 'lib/core/network/api_client.dart',
      code: `import 'package:dio/dio.dart';
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
          if (_authToken != null) {
            options.headers['Authorization'] = 'Bearer \$_authToken';
          }
          if (_activeOrgId != null) {
            options.headers['X-Organization-Id'] = _activeOrgId;
          }
          return handler.next(options);
        },
      ),
    );
  }

  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters}) =>
      _dio.get<T>(path, queryParameters: queryParameters);

  Future<Response<T>> post<T>(String path, {dynamic data}) =>
      _dio.post<T>(path, data: data);

  Future<Response<T>> put<T>(String path, {dynamic data}) =>
      _dio.put<T>(path, data: data);

  Future<Response<T>> delete<T>(String path) =>
      _dio.delete<T>(path);
}`,
    },
    api_remote_datasource: {
      title: 'REST API Remote DataSource',
      lang: 'dart',
      path: 'lib/data/remote/api_remote_data_source.dart',
      code: `import '../../core/network/api_client.dart';
import '../../core/network/api_endpoints.dart';

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
    return List<Map<String, dynamic>>.from(data is List ? data : data['data']);
  }

  @override
  Future<List<Map<String, dynamic>>> fetchTransactions(String orgId, {int limit = 50}) async {
    final response = await _client.get(
      ApiEndpoints.transactions,
      queryParameters: {'organizationId': orgId, 'limit': limit},
    );
    final data = response.data;
    return List<Map<String, dynamic>>.from(data is List ? data : data['data']);
  }

  @override
  Future<Map<String, dynamic>> createTransaction(Map<String, dynamic> data) async {
    final response = await _client.post(ApiEndpoints.transactions, data: data);
    return Map<String, dynamic>.from(response.data['data'] ?? response.data);
  }
}`,
    },
    auth_middleware: {
      title: 'GetX Auth Middleware & Tenant RBAC',
      lang: 'dart',
      path: 'lib/core/security/auth_middleware.dart',
      code: `import 'package:flutter/material.dart';
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
    if (!Get.isRegistered<AuthController>()) {
      return const RouteSettings(name: AppRoutes.login);
    }

    final authController = Get.find<AuthController>();

    // 1. Unauthenticated check
    if (!authController.isAuthenticated.value) {
      return const RouteSettings(name: AppRoutes.login);
    }

    // 2. Organization check (Tenant isolation)
    if (authController.activeOrganization.value == null && 
        route != AppRoutes.selectOrganization) {
      return const RouteSettings(name: AppRoutes.selectOrganization);
    }

    // 3. Role-Based Access Control (RBAC) authorization
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

    return null;
  }
}`,
    },
    financial_calc: {
      title: 'Financial Calculator & High Precision Decimal Rules',
      lang: 'dart',
      path: 'lib/core/utils/financial_calculator.dart',
      code: `import 'package:decimal/decimal.dart';

class FinancialCalculator {
  /// Validates whether a double-entry journal entry is strictly balanced
  /// Sum of Debits must equal Sum of Credits exactly.
  static bool validateDoubleEntryBalance({
    required List<Decimal> debits,
    required List<Decimal> credits,
  }) {
    final totalDebits = debits.fold<Decimal>(Decimal.zero, (prev, curr) => prev + curr);
    final totalCredits = credits.fold<Decimal>(Decimal.zero, (prev, curr) => prev + curr);
    
    return totalDebits == totalCredits && totalDebits > Decimal.zero;
  }

  /// Calculates loan monthly installment using standard amortization formula
  /// M = P * [r(1+r)^n] / [(1+r)^n - 1]
  static Decimal calculateAmortization({
    required Decimal principal,
    required Decimal annualRatePct,
    required int termMonths,
  }) {
    if (termMonths <= 0) return Decimal.zero;
    if (annualRatePct <= Decimal.zero) {
      return (principal / Decimal.fromInt(termMonths)).toDecimal(scaleOnInfinitePrecision: 4);
    }

    final p = principal.toDouble();
    final r = (annualRatePct.toDouble() / 100.0) / 12.0;
    final n = termMonths;

    final numerator = p * (r * _pow(1 + r, n));
    final denominator = _pow(1 + r, n) - 1.0;
    final monthly = numerator / denominator;

    return Decimal.parse(monthly.toStringAsFixed(4));
  }
}`,
    },
    sync_queue_engine: {
      title: 'Offline SyncQueue & Background Processor',
      lang: 'dart',
      path: 'lib/data/synchronization/sync_queue.dart',
      code: `import 'package:uuid/uuid.dart';
import '../local/daos/sync_queue_dao.dart';

class SyncQueue {
  final ISyncQueueDao _dao;
  final _uuid = const Uuid();

  SyncQueue(this._dao);

  Future<String> enqueueMutation({
    required String entityType,
    required String entityId,
    required String operationType, // 'create', 'update', 'delete'
    required Map<String, dynamic> payload,
    int version = 1,
  }) async {
    final operationId = _uuid.v4();
    final item = SyncQueueItem(
      id: operationId,
      entityType: entityType,
      entityId: entityId,
      operationType: operationType,
      payload: payload,
      createdAt: DateTime.now(),
      status: 'pending',
      retryCount: 0,
      version: version,
    );

    await _dao.enqueue(item);
    return operationId;
  }

  Future<List<SyncQueueItem>> getNextBatch({int limit = 50}) =>
      _dao.getPendingOperations(limit: limit);

  Future<void> markInProgress(String id) => _dao.markOperationInProgress(id);
  Future<void> markCompleted(String id) => _dao.markOperationSynced(id);
  Future<void> markFailed(String id, String error, int retries) =>
      _dao.markOperationFailed(id, error, retries);
}`,
    },
    conflict_resolver: {
      title: 'Client-Wins Conflict Resolver & Audit Trail',
      lang: 'dart',
      path: 'lib/data/synchronization/sync_conflict_resolver.dart',
      code: `class SyncConflictResolver {
  /// Strategy: Client-Wins with Immutable Audit Versioning
  static ConflictResolutionResult resolveConflict({
    required String entityType,
    required String entityId,
    required Map<String, dynamic> localPayload,
    required Map<String, dynamic> remotePayload,
    required int currentVersion,
  }) {
    final nextVersion = currentVersion + 1;
    final resolvedPayload = Map<String, dynamic>.from(localPayload);
    resolvedPayload['version'] = nextVersion;
    resolvedPayload['updated_at'] = DateTime.now().toIso8601String();

    final auditEntry = {
      'entity_type': entityType,
      'entity_id': entityId,
      'action': 'CONFLICT_CLIENT_WINS',
      'superseded_remote_state': remotePayload,
      'applied_local_state': localPayload,
      'version': nextVersion,
      'resolved_at': DateTime.now().toIso8601String(),
    };

    return ConflictResolutionResult(
      resolvedPayload: resolvedPayload,
      conflictOccurred: true,
      auditEntry: auditEntry,
    );
  }
}`,
    },
    drift_sqlite_schema: {
      title: 'Drift SQLite Offline Tables (Accounts, Transactions, Queue)',
      lang: 'dart',
      path: 'lib/data/local/database/tables/local_accounts.dart',
      code: `import 'package:drift/drift.dart';

@DataClassName('LocalAccountRecord')
class LocalAccounts extends Table {
  TextColumn get id => text()();
  TextColumn get orgId => text()();
  TextColumn get name => text()();
  TextColumn get type => text()(); // bank, cash, savings, credit_card, digital_wallet
  TextColumn get currency => text().withDefault(const Constant('PKR'))();
  TextColumn get balance => text().withDefault(const Constant('0.0000'))();
  TextColumn get initialBalance => text().withDefault(const Constant('0.0000'))();
  DateTimeColumn get updatedAt => dateTime()();
  TextColumn get syncStatus => text().withDefault(const Constant('synced'))();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('SyncOperationRecord')
class SyncOperations extends Table {
  TextColumn get id => text()();
  TextColumn get entityType => text()();
  TextColumn get entityId => text()();
  TextColumn get operationType => text()();
  TextColumn get payloadJson => text()();
  DateTimeColumn get createdAt => dateTime()();
  TextColumn get status => text().withDefault(const Constant('pending'))();
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  IntColumn get version => integer().withDefault(const Constant(1))();

  @override
  Set<Column> get primaryKey => {id};
}`,
    },
    tx_usecase: {
      title: 'Transaction Domain Usecase & Reconciliation',
      lang: 'dart',
      path: 'lib/features/transactions/domain/usecases/create_transaction_usecase.dart',
      code: `import 'package:decimal/decimal.dart';

enum TransactionType { income, expense, transfer }

class AccountBalanceReconciliation {
  /// Pure function calculating updated balances given transaction type and amount
  static Map<String, Decimal> calculateNewBalances({
    required TransactionType type,
    required Decimal sourceCurrentBalance,
    required Decimal amount,
    Decimal? destinationCurrentBalance,
  }) {
    if (amount <= Decimal.zero) {
      throw ArgumentError('Transaction amount must be strictly greater than zero.');
    }

    switch (type) {
      case TransactionType.income:
        return {'source': sourceCurrentBalance + amount};

      case TransactionType.expense:
        return {'source': sourceCurrentBalance - amount};

      case TransactionType.transfer:
        if (destinationCurrentBalance == null) {
          throw ArgumentError('Transfers require a valid destination account.');
        }
        return {
          'source': sourceCurrentBalance - amount,
          'destination': destinationCurrentBalance + amount,
        };
    }
  }
}`,
    },
    auth_profiles_sql: {
      title: 'Supabase Auth & Profiles Table Migration',
      lang: 'sql',
      path: 'supabase/migrations/20261010000000_init_supabase_auth_and_profiles.sql',
      code: `-- Target Project: https://tjurgvynlgaxeexewgfw.supabase.co
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (name) STORED,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    phone TEXT,
    preferred_currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, NOW())
);

-- Automated registration trigger on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, avatar_url, phone, preferred_currency)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'preferred_currency', 'PKR')
    )
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS and add policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());`,
    },
    sql_schema: {
      title: 'PostgreSQL Relational Schema Migration',
      lang: 'sql',
      path: 'supabase/migrations/20261010000000_finova_core_schema.sql',
      code: `-- Multi-tenant core tables with numeric exact precision
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('cash', 'bank', 'savings', 'credit_card', 'digital_wallet', 'investment')),
    currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
    current_balance NUMERIC(18, 4) NOT NULL DEFAULT 0.0000
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    destination_account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount NUMERIC(18, 4) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
    exchange_rate NUMERIC(12, 6) NOT NULL DEFAULT 1.000000,
    base_currency_amount NUMERIC(18, 4) NOT NULL
);`,
    },
    rls_policies: {
      title: 'Supabase Row Level Security (RLS) Isolation',
      lang: 'sql',
      path: 'supabase/migrations/20261010000001_finova_rls_policies.sql',
      code: `-- Tenant isolation helper function
CREATE OR REPLACE FUNCTION public.user_has_org_access(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Transactions RLS: STRICT tenant confinement
CREATE POLICY "Members can view transactions in their organization"
    ON public.transactions FOR SELECT
    USING (public.user_has_org_access(organization_id));

CREATE POLICY "Authorized roles can insert transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (public.user_can_write_finances(organization_id));`,
    },
  };

  const handleCopy = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentFile = filesMap[activeFileKey];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Flutter Clean Architecture & Supabase Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Production-grade Dart / GetX codebase structure and PostgreSQL RLS security migrations.
          </p>
        </div>

        <button
          onClick={() => {
            const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = currentFile.path.split('/').pop() || 'finova_code.txt';
            a.click();
          }}
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/20"
        >
          <Download className="h-4 w-4" />
          <span>Download File</span>
        </button>
      </div>

      {/* Clean Architecture Blueprint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
            <Cpu className="h-4 w-4" />
            <span>1. Domain Layer</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Entities, usecases, high-precision monetary calculators, decimal rules, and repository interfaces. Independent of external frameworks.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-2">
            <Database className="h-4 w-4" />
            <span>2. REST API & Local Drift</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Decoupled REST API services (Dio) calling backend server endpoints, backed by Drift SQLite offline caching and queue drainer.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <Layers className="h-4 w-4" />
            <span>3. Presentation Layer</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Reactive GetX Controllers, responsive Flutter UI widgets, Adaptive Mobile/Desktop viewports, and FL Charts integration.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>4. Backend-Only Security</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Bearer JWT token interceptors, tenant verification via backend gateway, and zero direct database credentials in client code.
          </p>
        </div>
      </div>

      {/* Code Browser */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        {/* File Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 bg-slate-900/80 px-4 py-2 overflow-x-auto">
          {Object.entries(filesMap).map(([key, f]) => (
            <button
              key={key}
              onClick={() => setActiveFileKey(key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition whitespace-nowrap ${
                activeFileKey === key
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>{f.path.split('/').pop()}</span>
            </button>
          ))}
        </div>

        {/* File Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 px-6 py-3">
          <div>
            <h4 className="text-sm font-bold text-white">{currentFile.title}</h4>
            <span className="font-mono text-[11px] text-slate-500">{currentFile.path}</span>
          </div>

          <button
            onClick={() => handleCopy(activeFileKey, currentFile.code)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            {copiedKey === activeFileKey ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Body */}
        <div className="p-6 overflow-x-auto max-h-[500px] scrollbar-thin">
          <pre className="font-mono text-xs text-slate-300 leading-relaxed">
            <code>{currentFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
