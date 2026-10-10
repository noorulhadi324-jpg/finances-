-- =====================================================================
-- FINOVA Seed Data for Development & Testing
-- =====================================================================

-- Demo Organization 1: Finova Global Ltd (PKR base)
INSERT INTO public.organizations (id, name, slug, base_currency, tax_identifier, fiscal_year_start_month)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Finova Enterprise Solutions', 'finova-enterprise', 'PKR', 'NTN-7492819-2', 7),
    ('b0000000-0000-0000-0000-000000000002', 'Apex Digital Studio', 'apex-studio', 'USD', 'EIN-99238410', 1)
ON CONFLICT (id) DO NOTHING;

-- Standard Chart of Accounts for Finova Enterprise
INSERT INTO public.chart_of_accounts (id, organization_id, code, name, account_type, sub_type)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '1010', 'Petty Cash', 'asset', 'Cash & Equivalents'),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '1020', 'Operating Bank Account (Meezan)', 'asset', 'Cash & Equivalents'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '1050', 'Accounts Receivable', 'asset', 'Receivables'),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '2010', 'Accounts Payable', 'liability', 'Current Liabilities'),
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '3010', 'Owner Equity', 'equity', 'Equity'),
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '4010', 'Software Consulting Revenue', 'revenue', 'Operating Revenue'),
    ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '5010', 'Cloud Infrastructure & Hosting', 'expense', 'Operating Expense'),
    ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', '5020', 'Salaries & Contractor Fees', 'expense', 'Payroll')
ON CONFLICT (id) DO NOTHING;

-- Financial Accounts
INSERT INTO public.accounts (id, organization_id, chart_of_account_id, name, account_type, account_number_mask, institution_name, currency, initial_balance, current_balance, color_hex)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Meezan Corporate Checking', 'bank', '•••• 4920', 'Meezan Bank Ltd', 'PKR', 1500000.0000, 2450000.0000, '#059669'),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Treasury Petty Cash', 'cash', 'N/A', 'HQ Safe', 'PKR', 75000.0000, 52000.0000, '#10b981'),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', NULL, 'Standard Chartered Multi-Currency USD', 'savings', '•••• 8821', 'Standard Chartered', 'USD', 12000.0000, 18500.0000, '#2563eb'),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', NULL, 'Corporate Visa Platinum', 'credit_card', '•••• 1109', 'HBL', 'PKR', 0.0000, -185000.0000, '#dc2626')
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO public.transaction_categories (id, organization_id, name, type, icon, color_hex)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Client Retainers', 'income', 'briefcase', '#10b981'),
    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SaaS Subscriptions', 'income', 'repeat', '#06b6d4'),
    ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Cloud Infrastructure', 'expense', 'server', '#8b5cf6'),
    ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Office & Utilities', 'expense', 'building', '#f59e0b'),
    ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Salaries & Payroll', 'expense', 'users', '#ef4444'),
    ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Internal Account Transfer', 'transfer', 'arrow-left-right', '#64748b')
ON CONFLICT (id) DO NOTHING;
