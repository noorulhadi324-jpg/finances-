-- =====================================================================
-- FINOVA Supabase Row Level Security (RLS) & Multi-Tenant Authorization
-- Migration: 20261010000001_finova_rls_policies.sql
-- =====================================================================

-- Helper function: Get user membership role in given organization
CREATE OR REPLACE FUNCTION public.get_user_org_role(org_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT role INTO user_role
    FROM public.organization_members
    WHERE organization_id = org_id AND user_id = auth.uid();
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Verify user belongs to organization
CREATE OR REPLACE FUNCTION public.user_has_org_access(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Verify user is owner, admin or accountant (write privileged)
CREATE OR REPLACE FUNCTION public.user_can_write_finances(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    user_role := public.get_user_org_role(org_id);
    RETURN user_role IN ('owner', 'admin', 'accountant', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
CREATE POLICY "Users can view any profile within their organizations"
    ON public.profiles FOR SELECT
    USING (
        id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.organization_members m1
            JOIN public.organization_members m2 ON m1.organization_id = m2.organization_id
            WHERE m1.user_id = auth.uid() AND m2.user_id = public.profiles.id
        )
    );

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Users can insert their initial profile on signup"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- 3. Organizations Policies
CREATE POLICY "Users can view organizations they belong to"
    ON public.organizations FOR SELECT
    USING (public.user_has_org_access(id));

CREATE POLICY "Authenticated users can create an organization"
    ON public.organizations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners and Admins can update their organization"
    ON public.organizations FOR UPDATE
    USING (public.get_user_org_role(id) IN ('owner', 'admin'));

-- 4. Organization Members Policies
CREATE POLICY "Members can view other members in their organization"
    ON public.organization_members FOR SELECT
    USING (public.user_has_org_access(organization_id));

CREATE POLICY "Owners and Admins can invite or update organization members"
    ON public.organization_members FOR INSERT
    WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Owners and Admins can modify member roles"
    ON public.organization_members FOR UPDATE
    USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

-- 5. Accounts Policies
CREATE POLICY "Members can view accounts in their organization"
    ON public.accounts FOR SELECT
    USING (public.user_has_org_access(organization_id));

CREATE POLICY "Authorized roles can manage accounts"
    ON public.accounts FOR ALL
    USING (public.user_can_write_finances(organization_id))
    WITH CHECK (public.user_can_write_finances(organization_id));

-- 6. Transactions Policies
CREATE POLICY "Members can view transactions in their organization"
    ON public.transactions FOR SELECT
    USING (public.user_has_org_access(organization_id));

CREATE POLICY "Authorized roles can insert transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (public.user_can_write_finances(organization_id));

CREATE POLICY "Authorized roles can update non-reconciled transactions"
    ON public.transactions FOR UPDATE
    USING (public.user_can_write_finances(organization_id))
    WITH CHECK (public.user_can_write_finances(organization_id));

CREATE POLICY "Only Owners and Admins can delete transactions"
    ON public.transactions FOR DELETE
    USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

-- 7. Double-Entry Journal Entries Policies
CREATE POLICY "Members can view journal entries in their organization"
    ON public.journal_entries FOR SELECT
    USING (public.user_has_org_access(organization_id));

CREATE POLICY "Accountants, Admins, Owners can post journal entries"
    ON public.journal_entries FOR INSERT
    WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'accountant'));

-- Prevent deletion or direct overwrite of posted journal entries (Audit standard)
CREATE POLICY "Posted journal entries cannot be deleted"
    ON public.journal_entries FOR DELETE
    USING (is_posted = FALSE AND public.get_user_org_role(organization_id) IN ('owner', 'admin'));

-- 8. Budgets, Goals, Invoices Policies
CREATE POLICY "Members can view budgets"
    ON public.budgets FOR SELECT USING (public.user_has_org_access(organization_id));
CREATE POLICY "Authorized write budgets"
    ON public.budgets FOR ALL USING (public.user_can_write_finances(organization_id));

CREATE POLICY "Members can view goals"
    ON public.financial_goals FOR SELECT USING (public.user_has_org_access(organization_id));
CREATE POLICY "Authorized write goals"
    ON public.financial_goals FOR ALL USING (public.user_can_write_finances(organization_id));

CREATE POLICY "Members can view invoices"
    ON public.invoices FOR SELECT USING (public.user_has_org_access(organization_id));
CREATE POLICY "Authorized write invoices"
    ON public.invoices FOR ALL USING (public.user_can_write_finances(organization_id));

CREATE POLICY "Members can view bills"
    ON public.bills FOR SELECT USING (public.user_has_org_access(organization_id));
CREATE POLICY "Authorized write bills"
    ON public.bills FOR ALL USING (public.user_can_write_finances(organization_id));

CREATE POLICY "Members can view loans"
    ON public.loans FOR SELECT USING (public.user_has_org_access(organization_id));
CREATE POLICY "Authorized write loans"
    ON public.loans FOR ALL USING (public.user_can_write_finances(organization_id));

-- 9. Audit Logs Policies
CREATE POLICY "Members can view audit logs"
    ON public.audit_logs FOR SELECT USING (public.user_has_org_access(organization_id));

CREATE POLICY "System can record audit logs"
    ON public.audit_logs FOR INSERT WITH CHECK (public.user_has_org_access(organization_id));
