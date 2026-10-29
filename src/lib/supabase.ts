import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Static references so Vite's compiler can inline values from .env.local
const rawUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL) ||
  '';

const rawAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY) ||
  '';

export const supabaseUrl = String(rawUrl).trim().replace(/^["']|["']$/g, '');
export const supabaseAnonKey = String(rawAnonKey).trim().replace(/^["']|["']$/g, '');

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder') &&
  (supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://'))
);

/**
 * Functional check to safely determine if Supabase is properly configured.
 */
export const checkIsSupabaseConfigured = (): boolean => isSupabaseConfigured;
export const getIsSupabaseConfigured = (): boolean => isSupabaseConfigured;

export const isUuid = (val: unknown): val is string => {
  return (
    typeof val === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      val.trim()
    )
  );
};

// Create real client or placeholder client
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  : createClient(
      'https://placeholder-project.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          flowType: 'pkce',
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      }
    );

/**
 * Canonical OAuth redirect URL for Google and third-party providers.
 */
export const getGoogleAuthRedirectUrl = (): string => {
  if (typeof window === 'undefined') return '/chat';
  return `${window.location.origin}/chat`;
};

/**
 * Diagnostic and configuration metadata for Google Authentication in Supabase.
 */
export interface GoogleAuthConfig {
  isConfigured: boolean;
  provider: 'google';
  flowType: 'pkce';
  redirectUrl: string;
  scopes: string;
  callbackUrl: string;
  dashboardSteps: string[];
}

export const getGoogleAuthConfig = (): GoogleAuthConfig => {
  const host = getSupabaseConfigStatus().urlHost || 'ozvvxuzecwhlpbfongiy.supabase.co';
  return {
    isConfigured: isSupabaseConfigured,
    provider: 'google',
    flowType: 'pkce',
    redirectUrl: getGoogleAuthRedirectUrl(),
    scopes: 'email profile openid',
    callbackUrl: `https://${host}/auth/v1/callback`,
    dashboardSteps: [
      '1. Open Supabase Dashboard: https://supabase.com/dashboard/project/ozvvxuzecwhlpbfongiy',
      '2. Navigate to Authentication > Providers in the left sidebar menu',
      '3. Click on "Google" to open provider configuration',
      '4. Toggle "Enable Google provider" to ON',
      '5. Add your Google Client ID and Client Secret from Google Cloud Console',
      `6. In Google Cloud Console (APIs & Services > Credentials), add Authorized Redirect URI: https://${host}/auth/v1/callback`,
      '7. Click "Save" in the Supabase Dashboard',
    ],
  };
};

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  urlHost?: string;
  hasAnonKey: boolean;
  anonKeyLength?: number;
  diagnostic: string;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const hasUrl = Boolean(supabaseUrl && !supabaseUrl.includes('placeholder'));
  const hasKey = Boolean(supabaseAnonKey && !supabaseAnonKey.includes('placeholder'));
  
  let host = 'N/A';
  if (hasUrl) {
    try {
      host = new URL(supabaseUrl).host;
    } catch {
      host = 'invalid-url';
    }
  }

  return {
    isConfigured: isSupabaseConfigured,
    hasUrl,
    urlHost: host,
    hasAnonKey: hasKey,
    anonKeyLength: hasKey ? supabaseAnonKey.length : 0,
    diagnostic: isSupabaseConfigured
      ? `Supabase connected (Host: ${host}, Anon key length: ${supabaseAnonKey.length})`
      : `Missing or incomplete Supabase configuration (hasUrl: ${hasUrl}, hasAnonKey: ${hasKey})`,
  };
}

// Log non-sensitive status in browser for developer visibility
if (typeof window !== 'undefined') {
  const status = getSupabaseConfigStatus();
  if (status.isConfigured) {
    console.info(`[EMufti AI] Supabase configured. Host: ${status.urlHost}, Key length: ${status.anonKeyLength}`);
  } else {
    console.warn(`[EMufti AI] Supabase is NOT configured. hasUrl: ${status.hasUrl}, hasAnonKey: ${status.hasAnonKey}`);
  }
}

