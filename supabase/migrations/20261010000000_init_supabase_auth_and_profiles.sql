-- =====================================================================
-- FINOVA — Initial Supabase Auth & Profiles Migration
-- Target Project: https://tjurgvynlgaxeexewgfw.supabase.co
-- Migration: 20261010000000_init_supabase_auth_and_profiles.sql
-- Description: Sets up the public.profiles table referencing auth.users(id),
--              implements automated triggers on auth.users registration,
--              manages timestamps, and applies Row Level Security (RLS).
-- =====================================================================

-- 1. Ensure required cryptographic and UUID extensions are present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the Profiles Table linked to Supabase Auth
-- References auth.users(id) so that deleting an auth user removes their profile (CASCADE)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (name) STORED, -- Computed column for backward compatibility
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    phone TEXT,
    preferred_currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, NOW())
);

-- Comment for table documentation in Supabase Studio
COMMENT ON TABLE public.profiles IS 'User profiles synchronized with Supabase Auth (auth.users) for project https://tjurgvynlgaxeexewgfw.supabase.co';

-- 3. Automatic Timestamp Updater Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Supabase Auth Registration Trigger
-- Automatically creates a public.profiles entry whenever a user registers in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_display_name TEXT;
BEGIN
    -- Extract display name from metadata if provided, otherwise default to email username
    user_display_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (
        id,
        name,
        email,
        avatar_url,
        phone,
        preferred_currency,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        user_display_name,
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'preferred_currency', 'PKR'),
        timezone('utc'::text, NOW()),
        timezone('utc'::text, NOW())
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = timezone('utc'::text, NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger listening to Supabase auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. User Preferences & Session Settings Table (For App Integration)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme VARCHAR(10) NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    enable_push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    enable_email_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    default_organization_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, NOW())
);

-- Trigger to create default preferences on new profile creation
CREATE OR REPLACE FUNCTION public.handle_new_profile_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_user_preferences ON public.profiles;
CREATE TRIGGER trigger_create_user_preferences
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_profile_preferences();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 7. Profiles RLS Policies
-- Policy 1: Authenticated users can view their own profile or fellow members
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Policy 2: Users can update only their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Policy 3: Allow insert during sign-up
DROP POLICY IF EXISTS "Service trigger or user can insert profile" ON public.profiles;
CREATE POLICY "Service trigger or user can insert profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- 8. User Preferences RLS Policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences"
    ON public.user_preferences
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
    ON public.user_preferences
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
