import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

const STORAGE_KEY = 'finova_supabase_config';

export const DEFAULT_SUPABASE_URL = 'https://tjurgvynlgaxeexewgfw.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_lN2IrMrvYXKOnIb8G8PyGQ_O4pqqRXC';

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading Supabase config', e);
  }

  // Pre-configured with user's verified credentials
  return {
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_KEY,
    isConnected: true,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  activeClient = null; // Invalidate cached client
}

let activeClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (activeClient) return activeClient;
  const config = getStoredSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      activeClient = createClient(config.url, config.anonKey);
      return activeClient;
    } catch (e) {
      console.warn('Failed initializing Supabase client', e);
      return null;
    }
  }
  return null;
}

export function resetSupabaseClient(): void {
  activeClient = null;
}
