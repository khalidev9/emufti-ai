import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type AccentColor =
  | 'blue'
  | 'cyan'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'purple'
  | 'teal'
  | 'indigo';
export type InterfaceDensity = 'comfortable' | 'compact' | 'spacious';

export type FontSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  accentColor: AccentColor;
  customButtonColor: string;
  density: InterfaceDensity;
  fontSize: FontSize;
  reducedMotion: boolean;
  highContrast: boolean;
  systemPrefersReducedMotion: boolean;
  systemPrefersHighContrast: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setAccentColor: (accent: AccentColor) => void;
  setCustomButtonColor: (color: string) => void;
  setDensity: (density: InterfaceDensity) => void;
  setFontSize: (size: FontSize) => void;
  setReducedMotion: (reduced: boolean) => void;
  setHighContrast: (high: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ACCENT_COLORS: {
  id: AccentColor;
  label: string;
  name: string;
  class: string;
  hex: string;
  hsl: string;
  ringHsl: string;
  borderClass: string;
  bgClass: string;
}[] = [
  {
    id: 'blue',
    label: 'Royal Blue (Official EMufti)',
    name: 'Blue',
    class: 'bg-blue-600',
    hex: '#2563eb',
    hsl: '221 83% 53%',
    ringHsl: '221 83% 53%',
    borderClass: 'border-blue-500',
    bgClass: 'bg-blue-500/10',
  },
  {
    id: 'cyan',
    label: 'Light Blue (Sky)',
    name: 'Light Blue',
    class: 'bg-sky-500',
    hex: '#0284c7',
    hsl: '199 89% 48%',
    ringHsl: '199 89% 48%',
    borderClass: 'border-sky-500',
    bgClass: 'bg-sky-500/10',
  },
  {
    id: 'emerald',
    label: 'Green (Emerald)',
    name: 'Green',
    class: 'bg-emerald-600',
    hex: '#10b981',
    hsl: '160 84% 39%',
    ringHsl: '160 84% 39%',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-500/10',
  },
  {
    id: 'rose',
    label: 'Red (Crimson)',
    name: 'Red',
    class: 'bg-rose-600',
    hex: '#e11d48',
    hsl: '347 77% 50%',
    ringHsl: '347 77% 50%',
    borderClass: 'border-rose-500',
    bgClass: 'bg-rose-500/10',
  },
  {
    id: 'amber',
    label: 'Yellow (Warm Gold)',
    name: 'Yellow',
    class: 'bg-amber-500',
    hex: '#f59e0b',
    hsl: '43 96% 56%',
    ringHsl: '43 96% 56%',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-500/10',
  },
  {
    id: 'purple',
    label: 'Purple (Violet)',
    name: 'Purple',
    class: 'bg-purple-600',
    hex: '#8b5cf6',
    hsl: '258 90% 66%',
    ringHsl: '258 90% 66%',
    borderClass: 'border-purple-500',
    bgClass: 'bg-purple-500/10',
  },
  {
    id: 'teal',
    label: 'Teal (Oceanic)',
    name: 'Teal',
    class: 'bg-teal-600',
    hex: '#0d9488',
    hsl: '173 80% 36%',
    ringHsl: '173 80% 36%',
    borderClass: 'border-teal-500',
    bgClass: 'bg-teal-500/10',
  },
  {
    id: 'indigo',
    label: 'Indigo (Deep Royal)',
    name: 'Indigo',
    class: 'bg-indigo-600',
    hex: '#4f46e5',
    hsl: '239 84% 67%',
    ringHsl: '239 84% 67%',
    borderClass: 'border-indigo-500',
    bgClass: 'bg-indigo-500/10',
  },
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('emufti_theme') as Theme;
      if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
    }
    // Default initial/startup mode to White (Light mode)
    return 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('emufti_theme') as Theme;
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
        return 'dark';
      }
      if (saved === 'light') {
        document.documentElement.classList.remove('dark');
        return 'light';
      }
      if (saved === 'system') {
        const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isSystemDark) {
          document.documentElement.classList.add('dark');
          return 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          return 'light';
        }
      }
      // Default startup is White / Light mode
      document.documentElement.classList.remove('dark');
      return 'light';
    }
    return 'light';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    return (localStorage.getItem('emufti_accent') as AccentColor) || 'blue';
  });

  const [customButtonColor, setCustomButtonColorState] = useState<string>(() => {
    try {
      return localStorage.getItem('emufti_custom_button_color') || '#2563eb';
    } catch {
      return '#2563eb';
    }
  });

  const [density, setDensityState] = useState<InterfaceDensity>(() => {
    return (localStorage.getItem('emufti_density') as InterfaceDensity) || 'comfortable';
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    return (localStorage.getItem('emufti_font_size') as FontSize) || 'medium';
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    return localStorage.getItem('emufti_reduced_motion') === 'true';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('emufti_high_contrast') === 'true';
  });

  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] = useState(false);
  const [systemPrefersHighContrast, setSystemPrefersHighContrast] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    setSystemPrefersReducedMotion(motionQuery.matches);
    setSystemPrefersHighContrast(contrastQuery.matches);

    const onMotionChange = (e: MediaQueryListEvent) => setSystemPrefersReducedMotion(e.matches);
    const onContrastChange = (e: MediaQueryListEvent) => setSystemPrefersHighContrast(e.matches);

    motionQuery.addEventListener('change', onMotionChange);
    contrastQuery.addEventListener('change', onContrastChange);
    return () => {
      motionQuery.removeEventListener('change', onMotionChange);
      contrastQuery.removeEventListener('change', onContrastChange);
    };
  }, []);

  // Listen to cross-tab / cross-window storage events for instantaneous global synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromStorage = (e: StorageEvent) => {
      if (e.key === 'emufti_theme' && e.newValue) {
        setThemeState(e.newValue as Theme);
      } else if (e.key === 'emufti_accent' && e.newValue) {
        setAccentColorState(e.newValue as AccentColor);
      } else if (e.key === 'emufti_density' && e.newValue) {
        setDensityState(e.newValue as InterfaceDensity);
      } else if (e.key === 'emufti_font_size' && e.newValue) {
        setFontSizeState(e.newValue as FontSize);
      } else if (e.key === 'emufti_reduced_motion') {
        setReducedMotionState(e.newValue === 'true');
      } else if (e.key === 'emufti_high_contrast') {
        setHighContrastState(e.newValue === 'true');
      } else if (e.key === 'emufti_custom_button_color' && e.newValue) {
        setCustomButtonColorState(e.newValue);
      }
    };

    window.addEventListener('storage', syncFromStorage);
    return () => window.removeEventListener('storage', syncFromStorage);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let activeTheme: 'light' | 'dark' = 'light';
      if (theme === 'dark') {
        activeTheme = 'dark';
      } else if (theme === 'light') {
        activeTheme = 'light';
      } else {
        // 'system' synchronizes with OS preference
        activeTheme = mediaQuery.matches ? 'dark' : 'light';
      }

      setResolvedTheme(activeTheme);

      if (activeTheme === 'dark') {
        root.classList.add('dark');
        if (body) body.classList.add('dark');
        if (typeof document !== 'undefined' && document.body) {
          document.body.classList.add('dark');
        }
      } else {
        root.classList.remove('dark');
        if (body) body.classList.remove('dark');
        if (typeof document !== 'undefined' && document.body) {
          document.body.classList.remove('dark');
        }
      }

      try {
        root.style.colorScheme = activeTheme;
      } catch {}

      root.setAttribute('data-accent', accentColor);
      root.setAttribute('data-density', density);
      root.setAttribute('data-font-size', fontSize);
      if (body) {
        body.setAttribute('data-accent', accentColor);
        body.setAttribute('data-density', density);
        body.setAttribute('data-font-size', fontSize);
      }

      const activeAccentConfig = ACCENT_COLORS.find((c) => c.id === accentColor) || ACCENT_COLORS[0];
      try {
        root.style.setProperty('--primary', activeAccentConfig.hsl);
        root.style.setProperty('--ring', activeAccentConfig.ringHsl);
        root.style.setProperty('--accent-hex', activeAccentConfig.hex);
        root.style.setProperty('--btn-accent', customButtonColor || activeAccentConfig.hex);
        root.style.setProperty('--btn-accent-hover', `${customButtonColor || activeAccentConfig.hex}ee`);
      } catch {}

      if (reducedMotion) {
        root.classList.add('reduced-motion');
      } else {
        root.classList.remove('reduced-motion');
      }

      if (highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }

      // Notify window listeners of real-time theme application
      try {
        window.dispatchEvent(
          new CustomEvent('emufti-theme-change', {
            detail: { theme, resolvedTheme: activeTheme, accentColor },
          })
        );
      } catch {}
    };

    applyTheme();

    const listener = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const activeTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(activeTheme);
        if (activeTheme === 'dark') {
          root.classList.add('dark');
          if (body) body.classList.add('dark');
        } else {
          root.classList.remove('dark');
          if (body) body.classList.remove('dark');
        }
        try {
          root.style.colorScheme = activeTheme;
        } catch {}
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme, accentColor, density, fontSize, reducedMotion, highContrast]);

  const setTheme = (newTheme: Theme) => {
    let nextResolved: 'light' | 'dark' = 'light';
    if (newTheme === 'dark') {
      nextResolved = 'dark';
    } else if (newTheme === 'light') {
      nextResolved = 'light';
    } else {
      // System preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        nextResolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    }

    setThemeState(newTheme);
    setResolvedTheme(nextResolved);

    try {
      localStorage.setItem('emufti_theme', newTheme);
    } catch {}

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      if (nextResolved === 'dark') {
        root.classList.add('dark');
        if (body) body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        if (body) body.classList.remove('dark');
      }
      try {
        root.style.colorScheme = nextResolved;
      } catch {}
      try {
        window.dispatchEvent(
          new CustomEvent('emufti-theme-change', {
            detail: { theme: newTheme, resolvedTheme: nextResolved, accentColor },
          })
        );
      } catch {}
    }
  };

  const setAccentColor = (newAccent: AccentColor) => {
    setAccentColorState(newAccent);
    try {
      localStorage.setItem('emufti_accent', newAccent);
      const root = document.documentElement;
      root.setAttribute('data-accent', newAccent);
      const activeAccentConfig = ACCENT_COLORS.find((c) => c.id === newAccent) || ACCENT_COLORS[0];
      root.style.setProperty('--primary', activeAccentConfig.hsl);
      root.style.setProperty('--ring', activeAccentConfig.ringHsl);
      root.style.setProperty('--accent-hex', activeAccentConfig.hex);
      root.style.setProperty('--btn-accent', activeAccentConfig.hex);
      root.style.setProperty('--btn-accent-hover', `${activeAccentConfig.hex}ee`);
      setCustomButtonColorState(activeAccentConfig.hex);
      localStorage.setItem('emufti_custom_button_color', activeAccentConfig.hex);
    } catch {}
  };

  const setCustomButtonColor = (newColor: string) => {
    setCustomButtonColorState(newColor);
    try {
      localStorage.setItem('emufti_custom_button_color', newColor);
      const root = document.documentElement;
      root.style.setProperty('--btn-accent', newColor);
      root.style.setProperty('--btn-accent-hover', `${newColor}ee`);
      root.style.setProperty('--accent-hex', newColor);
    } catch {}
  };

  const setDensity = (newDensity: InterfaceDensity) => {
    setDensityState(newDensity);
    try {
      localStorage.setItem('emufti_density', newDensity);
      document.documentElement.setAttribute('data-density', newDensity);
    } catch {}
  };

  const setFontSize = (newSize: FontSize) => {
    setFontSizeState(newSize);
    try {
      localStorage.setItem('emufti_font_size', newSize);
      document.documentElement.setAttribute('data-font-size', newSize);
    } catch {}
  };

  const setReducedMotion = (reduced: boolean) => {
    setReducedMotionState(reduced);
    try {
      localStorage.setItem('emufti_reduced_motion', String(reduced));
      if (reduced) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    } catch {}
  };

  const setHighContrast = (high: boolean) => {
    setHighContrastState(high);
    try {
      localStorage.setItem('emufti_high_contrast', String(high));
      if (high) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    } catch {}
  };

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        accentColor,
        customButtonColor,
        density,
        fontSize,
        reducedMotion,
        highContrast,
        systemPrefersReducedMotion,
        systemPrefersHighContrast,
        setTheme,
        toggleTheme,
        setAccentColor,
        setCustomButtonColor,
        setDensity,
        setFontSize,
        setReducedMotion,
        setHighContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
