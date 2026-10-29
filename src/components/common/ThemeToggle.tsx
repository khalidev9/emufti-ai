import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, Theme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ${className}`}
      title={`Current Theme: ${theme} (Click to toggle)`}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-500 animate-in spin-in-180 duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-blue-600 animate-in spin-in-180 duration-200" />
      )}
    </button>
  );
};
