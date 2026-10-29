import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

describe('Supabase Google Authentication Configuration & Error Resilience', () => {

  describe('1. Supabase Client Google Auth Configuration (src/lib/supabase.ts)', () => {
    const supabasePath = path.join(projectRoot, 'src', 'lib', 'supabase.ts');
    const supabaseContent = fs.readFileSync(supabasePath, 'utf8');

    it('1.1 Supabase client initializes auth with PKCE flow and browser storage', () => {
      assert.ok(supabaseContent.includes("flowType: 'pkce'"), 'Uses PKCE flow');
      assert.ok(supabaseContent.includes('detectSessionInUrl: true'), 'Detects session in URL');
      assert.ok(supabaseContent.includes('persistSession: true'), 'Persists session');
      assert.ok(supabaseContent.includes('autoRefreshToken: true'), 'Auto refreshes token');
      assert.ok(supabaseContent.includes('storage: typeof window !== \'undefined\' ? window.localStorage : undefined'), 'Safely binds browser localStorage');
    });

    it('1.2 Exposes getGoogleAuthRedirectUrl helper', () => {
      assert.ok(supabaseContent.includes('export const getGoogleAuthRedirectUrl ='), 'Exports getGoogleAuthRedirectUrl');
      assert.ok(supabaseContent.includes('${window.location.origin}/chat'), 'Redirects to /chat by default');
    });

    it('1.3 Exposes getGoogleAuthConfig with complete developer dashboard steps', () => {
      assert.ok(supabaseContent.includes('export const getGoogleAuthConfig ='), 'Exports getGoogleAuthConfig');
      assert.ok(supabaseContent.includes('auth/v1/callback'), 'Specifies canonical Supabase callback URL');
      assert.ok(supabaseContent.includes('Enable Google provider'), 'Includes provider enable toggle step');
      assert.ok(supabaseContent.includes('Client ID and Client Secret'), 'Includes client credential setup step');
    });
  });

  describe('2. AuthContext Google Sign-In & Error Parsing (src/context/AuthContext.tsx)', () => {
    const authContextPath = path.join(projectRoot, 'src', 'context', 'AuthContext.tsx');
    const authContextContent = fs.readFileSync(authContextPath, 'utf8');

    it('2.1 signInWithGoogle requests required scopes (email, profile, openid)', () => {
      assert.ok(authContextContent.includes("provider: 'google'"), 'Uses google provider');
      assert.ok(authContextContent.includes("scopes: 'email profile openid'"), 'Requests email, profile, openid scopes');
      assert.ok(authContextContent.includes("access_type: 'offline'"), 'Requests offline access type');
    });

    it('2.2 parseSupabaseOAuthError comprehensively detects raw JSON and object error shapes', () => {
      assert.ok(authContextContent.includes('function parseSupabaseOAuthError'), 'Defines robust OAuth error parser');
      assert.ok(authContextContent.includes('unsupported provider'), 'Detects unsupported provider message');
      assert.ok(authContextContent.includes('provider is not enabled'), 'Detects provider is not enabled message');
      assert.ok(authContextContent.includes('validation_failed'), 'Detects validation_failed error code');
    });

    it('2.3 Returns actionable instructions guiding developer to Supabase Dashboard', () => {
      assert.ok(authContextContent.includes('Google Authentication is not yet enabled in the Supabase Dashboard'), 'Actionable explanation for users');
      assert.ok(authContextContent.includes('Authentication > Providers > Google'), 'Mentions exact dashboard path');
      assert.ok(authContextContent.includes('add your Google Client ID and Secret'), 'Guides adding credentials');
    });
  });

  describe('3. AuthPages OAuth URL Callback Handling & UI Alerts (src/pages/AuthPages.tsx)', () => {
    const authPagesPath = path.join(projectRoot, 'src', 'pages', 'AuthPages.tsx');
    const authPagesContent = fs.readFileSync(authPagesPath, 'utf8');

    it('3.1 AuthPages inspects URL query params and hash for OAuth errors on mount', () => {
      assert.ok(authPagesContent.includes('URLSearchParams(window.location.search)'), 'Checks URL search parameters');
      assert.ok(authPagesContent.includes('URLSearchParams(hashString)'), 'Checks URL hash parameters');
      assert.ok(authPagesContent.includes('window.history.replaceState'), 'Cleans URL hash after reading error');
    });

    it('3.2 AuthPages renders interactive Developer Setup Guide in error banner', () => {
      assert.ok(authPagesContent.includes('Tilmaamaha Horumariyaha (Developer Setup Guide)'), 'Includes interactive setup guide toggle');
      assert.ok(authPagesContent.includes('https://ozvvxuzecwhlpbfongiy.supabase.co/auth/v1/callback'), 'Displays exact callback redirect URI');
      assert.ok(authPagesContent.includes('Use Email &amp; Password below') || authPagesContent.includes('Use Email & Password below'), 'Prompts user to use email/password fallback');
    });

    it('3.3 "Continue with Google" button has loading state and Google SVG icon', () => {
      assert.ok(authPagesContent.includes('onClick={handleGoogleSignIn}'), 'Triggers handleGoogleSignIn');
      assert.ok(authPagesContent.includes('Connecting to Google...'), 'Displays connecting state');
      assert.ok(authPagesContent.includes('Continue with Google'), 'Displays button label');
    });
  });
});
