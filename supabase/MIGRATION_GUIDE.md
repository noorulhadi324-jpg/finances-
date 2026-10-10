# Supabase Migration Application Guide

**Target Supabase Project:** [https://tjurgvynlgaxeexewgfw.supabase.co](https://tjurgvynlgaxeexewgfw.supabase.co)  
**Project Reference ID:** `tjurgvynlgaxeexewgfw`

---

## Migration Files Overview

| File | Purpose |
| :--- | :--- |
| `20261010000000_init_supabase_auth_and_profiles.sql` | **Core Auth & Profiles**: Sets up `public.profiles` linked to `auth.users(id)`, automated registration trigger, `updated_at` trigger, and RLS policies. |
| `20261010000000_finova_core_schema.sql` | **Financial Engine**: Relational tables for accounts, transactions, double-entry general ledger, budgets, goals, and invoices. |
| `20261010000001_finova_rls_policies.sql` | **Multi-Tenant RLS**: Cross-tenant isolation policies and RBAC security functions. |
| `seed.sql` | **Seed Data**: Sample accounts, categories, and balanced ledger lines for initial testing. |

---

## Method 1: Apply via Supabase Dashboard (Recommended — No CLI Needed)

### Step 1: Open Supabase SQL Editor
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard/project/tjurgvynlgaxeexewgfw).
2. In the left navigation menu, click on the **SQL Editor** icon (terminal symbol).
3. Click **"+ New query"** in the top left.

### Step 2: Paste and Execute the Auth & Profiles Migration
1. Copy the complete contents of `supabase/migrations/20261010000000_init_supabase_auth_and_profiles.sql`.
2. Paste the SQL into the editor query pane.
3. Click the green **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`).
4. You should see a success message: `Success. No rows returned`.

### Step 3: (Optional) Apply the Remaining Finance Modules
1. Click **"+ New query"** again.
2. Paste and run `supabase/migrations/20261010000000_finova_core_schema.sql`.
3. Paste and run `supabase/migrations/20261010000001_finova_rls_policies.sql`.
4. Run `supabase/seed.sql` to populate sample accounts and categories.

---

## Method 2: Apply via Supabase CLI

If you manage your project locally with the Supabase CLI:

### Step 1: Install and Authenticate CLI
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Authenticate with your Supabase account
supabase login
```

### Step 2: Link to Your Cloud Project
```bash
# Link to project reference tjurgvynlgaxeexewgfw
supabase link --project-ref tjurgvynlgaxeexewgfw
```

### Step 3: Push Migrations to Remote Database
```bash
# Push all pending migrations in the supabase/migrations directory
supabase db push
```

---

## Verification & Testing

### 1. Verify Table and Triggers in Supabase Studio
1. In the Supabase Dashboard, go to **Table Editor** -> **public.profiles**.
2. Confirm the columns are present:
   - `id` (UUID, Foreign Key to `auth.users.id`)
   - `name` (TEXT)
   - `full_name` (TEXT, Generated)
   - `email` (TEXT, Unique)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)
3. Go to **Database** -> **Triggers** and verify:
   - `on_auth_user_created` on table `auth.users`
   - `trigger_set_profiles_updated_at` on table `public.profiles`

### 2. Test Automated Profile Creation
1. Go to **Authentication** -> **Users** in the Supabase Dashboard.
2. Click **"Add user"** -> **"Create user"**.
3. Enter an email (e.g. `test@finova.internal`) and a password.
4. Check **Table Editor** -> **public.profiles**:
   - A corresponding row with the exact `id` and `email` should appear automatically!

### 3. Verify Row Level Security (RLS)
1. Go to **Authentication** -> **Policies**.
2. Select `public.profiles` and verify the three active policies:
   - `Users can view own profile` (SELECT)
   - `Users can update own profile` (UPDATE)
   - `Service trigger or user can insert profile` (INSERT)
