/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';
import type { SettingsState, SettingsAction } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { settingsReducer } from '../reducers/settingsReducer';
import { STORAGE_KEYS } from '../constants/storage';

interface SettingsContextValue {
  state: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function initializeSettings(): SettingsState {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        themeMode: parsed.themeMode || DEFAULT_SETTINGS.themeMode,
        defaultView: parsed.defaultView || DEFAULT_SETTINGS.defaultView,
        schemaVersion: parsed.schemaVersion ?? DEFAULT_SETTINGS.schemaVersion,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

function dispatchToast(message: string, variant: 'default' | 'destructive' = 'destructive') {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, variant } }));
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, null, initializeSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        dispatchToast('Storage quota exceeded. Settings may not be saved.', 'destructive');
      } else {
        dispatchToast('Failed to save settings.', 'destructive');
      }
    }
  }, [state]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.SETTINGS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          dispatch({ type: 'SET_THEME_MODE', payload: parsed.themeMode });
          dispatch({ type: 'SET_DEFAULT_VIEW', payload: parsed.defaultView });
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
}
