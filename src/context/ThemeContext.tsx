/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { SettingsContext } from './SettingsContext';

interface ThemeContextValue {
  resolvedTheme: 'light' | 'dark';
}

export const ThemeContext = createContext<ThemeContextValue>({ resolvedTheme: 'light' });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const settingsCtx = useContext(SettingsContext);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (!settingsCtx) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setResolvedTheme('light');
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    const { themeMode } = settingsCtx.state;

    if (themeMode === 'light') {
      setResolvedTheme('light');
      document.documentElement.classList.remove('dark');
    } else if (themeMode === 'dark') {
      setResolvedTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      // System
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent | MediaQueryList) => {
        const isDark = e.matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      handler(mediaQuery);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settingsCtx, settingsCtx?.state.themeMode]);

  return (
    <ThemeContext.Provider value={{ resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
