# FINOVA — Professional Cross-Platform Finance Management System

FINOVA is an enterprise-grade financial management system built with **Flutter, Dart, GetX, Supabase, and PostgreSQL**, featuring Clean Architecture, double-entry bookkeeping, multi-tenant organization isolation, and Row Level Security (RLS).

---

## 1. Architecture Overview

FINOVA follows feature-first Clean Architecture divided into four decoupled layers:

```
lib/
├── core/
│   ├── constants/                          # Database, app & storage constants
│   ├── errors/                             # AppException and Failure models
│   ├── network/                            # Reactive ConnectivityService
│   ├── formatters/                         # Currency & date formatters
│   ├── security/auth_middleware.dart       # GetX route middleware & RBAC
│   └── utils/financial_calculator.dart     # Decimal precision & Debits=Credits checks
├── data/
│   ├── local/
│   │   ├── database/                       # Drift SQLite AppDatabase & Table schemas
│   │   │   └── tables/                     # Local accounts, transactions, sync_operations
│   │   └── daos/                           # Typed DAOs for accounts, tx, and sync queue
│   ├── remote/                             # Supabase remote datasource and client wrapper
│   └── synchronization/                    # SyncQueue, SyncService, ConflictResolver & RetryPolicy
├── features/
│   ├── authentication/                     # Session, profile & tenant selection
│   ├── accounts/                           # Bank, cash, savings, credit facilities
│   ├── transactions/                       # Income, expense & atomic transfers
│   ├── budgets/                            # Spending limits & threshold warnings
│   ├── goals/                              # Capital target goals & deposits
│   ├── invoices/                           # Commercial invoicing & PDF receipts
│   ├── accounting/                         # Double-entry general ledger & trial balance
│   └── dashboard/                          # Executive KPIs, cash flow & charts
├── app/
│   ├── routes/                             # Declarative GetX routing
│   └── theme/                              # Enterprise fintech dark theme
└── main.dart                               # Supabase bootstrap & GetMaterialApp
```

---

## 2. Supabase Backend Setup

### A. Run Database Migrations
1. In your Supabase dashboard or via Supabase CLI, execute:
   - `supabase/migrations/20261010000000_finova_core_schema.sql` (Creates relational tables with NUMERIC exact columns, indexes, and foreign keys).
   - `supabase/migrations/20261010000001_finova_rls_policies.sql` (Enables Row Level Security and tenant-isolation rules across all tables).
   - `supabase/seed.sql` (Seeds demo enterprise organization, accounts, chart of accounts, and balanced journal entries).

### B. Environment Configuration
Pass your public Supabase credentials at launch:
```bash
flutter run --dart-define=SUPABASE_URL=https://your-project.supabase.co --dart-define=SUPABASE_ANON_KEY=your-anon-key
```

---

## 3. Financial Invariants & Business Logic

1. **Double-Entry Equilibrium**:
   - Every posted journal entry enforces $\sum \text{Debits} = \sum \text{Credits}$.
   - Once posted, journal lines cannot be mutated or silently overwritten.
2. **Neutral Account Transfers**:
   - Transfers debit the source account and credit the destination account atomically.
   - Transfers are strictly isolated and do not inflate gross income or gross expense figures.
3. **Multi-Currency Support**:
   - Real-time exchange rate normalization for PKR, USD, EUR, GBP, AED, and SAR.
4. **Tenant Isolation**:
   - PostgreSQL RLS enforces that users only access accounts, transactions, and reports within organizations where they hold valid membership.

---

## 4. Running Tests

Run the Dart unit test suite:
```bash
flutter test test/unit/financial_calculator_test.dart
```

---

## 5. Multi-Platform Build Commands

- **Web**: `flutter build web --release`
- **Android**: `flutter build apk --release`
- **iOS**: `flutter build ipa --release`
- **Windows**: `flutter build windows --release`
- **macOS**: `flutter build macos --release`
