-- =====================================================================
-- FINOVA Core PostgreSQL Relational Schema
-- Version: 1.0.0
-- Migration: 20261010000000_finova_core_schema.sql
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    preferred_currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Organizations Table (Multi-tenant isolation)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    base_currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
    tax_identifier TEXT,
    fiscal_year_start_month SMALLINT NOT NULL DEFAULT 1 CHECK (fiscal_year_start_month BETWEEN 1 AND 12),
    logo_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Organization Members & Roles (RBAC)
-- Roles: owner, admin, accountant, manager, member, readonly
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'accountant', 'manager', 'member', 'readonly')),
    invited_email TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 4. Chart of Accounts (Standard accounting classifications)
-- Types: asset, liability, equity, revenue, expense
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name TEXT NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    sub_type VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    parent_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- 5. Financial Accounts (Cash, Bank, Wallet, Credit, Investment)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    chart_of_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('cash', 'bank', 'savings', 'credit_card', 'digital_wallet', 'investment', 'loan')),
    account_number_mask VARCHAR(16),
    institution_name TEXT,
    currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
    initial_balance NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    current_balance NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    color_hex VARCHAR(7) DEFAULT '#10b981',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Transaction Categories
CREATE TABLE IF NOT EXISTS public.transaction_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    icon TEXT NOT NULL DEFAULT 'tag',
    color_hex VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    parent_id UUID REFERENCES public.transaction_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, name, type)
);

-- 7. Transactions (Income, Expense, Transfer)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    destination_account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES public.transaction_categories(id) ON DELETE SET NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount NUMERIC(18, 4) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
    exchange_rate NUMERIC(12, 6) NOT NULL DEFAULT 1.000000,
    base_currency_amount NUMERIC(18, 4) NOT NULL,
    fee_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payee_or_payer TEXT,
    reference_number TEXT,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'cleared' CHECK (status IN ('pending', 'cleared', 'reconciled', 'void')),
    receipt_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT transfer_dest_check CHECK (
        (type = 'transfer' AND destination_account_id IS NOT NULL AND destination_account_id <> account_id)
        OR (type <> 'transfer' AND destination_account_id IS NULL)
    )
);

-- 8. Transaction Splits (itemized breakdown)
CREATE TABLE IF NOT EXISTS public.transaction_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.transaction_categories(id) ON DELETE RESTRICT,
    amount NUMERIC(18, 4) NOT NULL CHECK (amount > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Double-Entry Journal Entries & Lines (Strict Bookkeeping)
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    entry_number TEXT NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    memo TEXT NOT NULL,
    is_posted BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, entry_number)
);

CREATE TABLE IF NOT EXISTS public.journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    chart_of_account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    debit NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (debit >= 0),
    credit NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (credit >= 0),
    description TEXT,
    CONSTRAINT debit_or_credit_positive CHECK (debit > 0 OR credit > 0),
    CONSTRAINT not_both_debit_credit CHECK (NOT (debit > 0 AND credit > 0))
);

-- 10. Budgets and Budget Categories
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    period_type VARCHAR(10) NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budgeted NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.transaction_categories(id) ON DELETE CASCADE,
    allocated_amount NUMERIC(18, 4) NOT NULL CHECK (allocated_amount >= 0),
    warning_threshold_pct NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    UNIQUE(budget_id, category_id)
);

-- 11. Financial Goals & Contributions
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(18, 4) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (current_amount >= 0),
    target_date DATE NOT NULL,
    linked_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    category_tag VARCHAR(50),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.goal_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.financial_goals(id) ON DELETE CASCADE,
    amount NUMERIC(18, 4) NOT NULL CHECK (amount > 0),
    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Bills & Recurring Obligations
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    payee TEXT NOT NULL,
    amount NUMERIC(18, 4) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    category_id UUID REFERENCES public.transaction_categories(id) ON DELETE SET NULL,
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('once', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual')),
    status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid', 'overdue')),
    auto_pay BOOLEAN NOT NULL DEFAULT FALSE,
    linked_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Invoices & Receivables
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
    subtotal NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    tax_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    discount_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    total_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    amount_paid NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(12, 4) NOT NULL DEFAULT 1.0000 CHECK (quantity > 0),
    unit_price NUMERIC(18, 4) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(18, 4) NOT NULL
);

-- 14. Loans & Debts
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    loan_type VARCHAR(20) NOT NULL CHECK (loan_type IN ('borrowed', 'lent')),
    lender_or_borrower TEXT NOT NULL,
    principal_amount NUMERIC(18, 4) NOT NULL CHECK (principal_amount > 0),
    interest_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    term_months INTEGER NOT NULL CHECK (term_months > 0),
    monthly_installment NUMERIC(18, 4) NOT NULL,
    remaining_balance NUMERIC(18, 4) NOT NULL,
    start_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Audit Logs (Tamper-evident trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ultra-fast query execution
CREATE INDEX IF NOT EXISTS idx_accounts_org ON public.accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org_date ON public.transactions(organization_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_org ON public.journal_entries(organization_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
