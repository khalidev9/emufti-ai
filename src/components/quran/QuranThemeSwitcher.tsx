import React, { useState, useRef, useEffect } from 'react';
import { Palette, Sun, Moon, Sparkles, Monitor, Check } from 'lucide-react';

export type QuranReadingThemeMode = 'auto' | 'light' | 'sepia' | 'dark';

interface QuranThemeSwitcherProps {
  currentTheme: QuranReadingThemeMode;
  onSelectTheme: (theme: QuranReadingThemeMode) => void;
}

export const QuranThemeSwitcher: React.FC<QuranThemeSwitcherProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const themes: Array<{
    id: QuranReadingThemeMode;
    label: string;
    icon: React.ElementType;
    bgPreview: string;
  }> = [
    { id: 'auto', label: 'Auto', icon: Monitor, bgPreview: 'bg-gradient-to-r from-white to-stone-900' },
    { id: 'light', label: 'Light', icon: Sun, bgPreview: 'bg-white border border-slate-300' },
    { id: 'sepia', label: 'Sepia', icon: Sparkles, bgPreview: 'bg-[#f8f1e5] border border-amber-300' },
    { id: 'dark', label: 'Dark', icon: Moon, bgPreview: 'bg-[#121212] border border-stone-700' },
  ];

  return (
    <div
      ref={containerRef}
      className="hidden md:block fixed bottom-6 left-6 z-40"
      style={{ direction: 'ltr' }}
    >
      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-3 w-48 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Reading Theme
          </div>
          <div className="space-y-1 mt-1">
            {themes.map((th) => {
              const Icon = th.icon;
              const isSelected = currentTheme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    onSelectTheme(th.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full ${th.bgPreview} shrink-0`} />
                    <span>{th.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Pill Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 rounded-full bg-white dark:bg-stone-900 border border-slate-200/90 dark:border-stone-800 text-slate-800 dark:text-stone-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2 active:scale-95"
        title="Change Quran Theme"
        aria-label="Change Quran Theme"
      >
        <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span>Change Theme</span>
      </button>
    </div>
  );
};
