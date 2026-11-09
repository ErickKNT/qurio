import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'qurio_theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('No se pudo guardar la preferencia de tema:', e);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    window.dispatchEvent(new CustomEvent('qurio-theme-change', { detail: newTheme }));
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  useEffect(() => {
    applyTheme(theme);

    const handleThemeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      if (customEvent.detail && customEvent.detail !== theme) {
        setThemeState(customEvent.detail);
      }
    };

    window.addEventListener('qurio-theme-change', handleThemeEvent);
    return () => window.removeEventListener('qurio-theme-change', handleThemeEvent);
  }, [theme]);

  return { theme, isDark: theme === 'dark', toggleTheme, setTheme };
}
