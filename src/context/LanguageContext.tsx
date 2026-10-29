// ==============================================================================
// EMUFTI AI — Language & Direction Context Provider
// Manages interface language (so, en, ar), document direction (LTR/RTL),
// translation dictionary, and persistent profile synchronization.
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SupportedLanguage,
  Direction,
  SUPPORTED_LANGUAGES,
  isValidLanguage,
  getLanguageDirection,
  getTranslation,
} from '../lib/i18n';
import { useAuth } from './AuthContext';
import { storage } from '../lib/storage';

interface LanguageContextType {
  language: SupportedLanguage;
  direction: Direction;
  setLanguage: (lang: SupportedLanguage) => Promise<{ success: boolean; error?: string }>;
  t: (key: string, fallback?: string) => string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfile } = useAuth();

  // Initialize from storage or profile
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = storage.getPreferredLanguage?.() as SupportedLanguage;
    if (isValidLanguage(saved)) return saved;
    return 'en';
  });

  const direction = getLanguageDirection(language);

  // Apply HTML document attributes for language and direction (RTL / LTR)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = direction;
      // Add or remove rtl class on root for CSS targeting
      if (direction === 'rtl') {
        document.documentElement.classList.add('rtl');
        document.documentElement.classList.remove('ltr');
      } else {
        document.documentElement.classList.add('ltr');
        document.documentElement.classList.remove('rtl');
      }
    }
  }, [language, direction]);

  // Synchronize language when profile loads or updates from database
  useEffect(() => {
    if (profile?.preferred_language && isValidLanguage(profile.preferred_language)) {
      if (profile.preferred_language !== language) {
        setLanguageState(profile.preferred_language);
        storage.setPreferredLanguage?.(profile.preferred_language);
      }
    }
  }, [profile?.preferred_language]);

  // Set and persist language preference
  const setLanguage = useCallback(
    async (newLang: SupportedLanguage): Promise<{ success: boolean; error?: string }> => {
      if (!isValidLanguage(newLang)) {
        return { success: false, error: 'Invalid language code. Supported: so, en, ar.' };
      }

      try {
        setLanguageState(newLang);
        storage.setPreferredLanguage?.(newLang);

        if (typeof document !== 'undefined') {
          const dir = getLanguageDirection(newLang);
          document.documentElement.lang = newLang;
          document.documentElement.dir = dir;
          if (dir === 'rtl') {
            document.documentElement.classList.add('rtl');
            document.documentElement.classList.remove('ltr');
          } else {
            document.documentElement.classList.add('ltr');
            document.documentElement.classList.remove('rtl');
          }
        }

        // Persist to Supabase user profile if authenticated
        if (profile) {
          const res = await updateProfile({ preferred_language: newLang });
          if (res?.error) {
            console.warn('[LanguageContext] Supabase profile sync notice:', res.error);
            return { success: false, error: res.error };
          }
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to persist language preference.' };
      }
    },
    [profile, updateProfile]
  );

  const t = useCallback(
    (key: string, fallback?: string): string => {
      return getTranslation(language, key, fallback);
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      <div dir={direction} className={direction === 'rtl' ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for components outside LanguageProvider
    return {
      language: 'en',
      direction: 'ltr',
      setLanguage: async () => ({ success: true }),
      t: (key: string, fallback?: string) => fallback || key,
      supportedLanguages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
};
