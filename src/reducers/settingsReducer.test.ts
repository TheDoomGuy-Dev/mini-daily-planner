import { describe, it, expect } from 'vitest';
import { settingsReducer } from './settingsReducer';
import { DEFAULT_SETTINGS } from '../types/settings';

describe('settingsReducer', () => {
  it('should handle SET_THEME_MODE', () => {
    const state = settingsReducer(DEFAULT_SETTINGS, { type: 'SET_THEME_MODE', payload: 'dark' });
    expect(state.themeMode).toBe('dark');
  });

  it('should handle SET_DEFAULT_VIEW', () => {
    const state = settingsReducer(DEFAULT_SETTINGS, { type: 'SET_DEFAULT_VIEW', payload: 'upcoming' });
    expect(state.defaultView).toBe('upcoming');
  });

  it('should handle RESET_SETTINGS', () => {
    const modified = { themeMode: 'dark' as const, defaultView: 'upcoming' as const, schemaVersion: 1 };
    const state = settingsReducer(modified, { type: 'RESET_SETTINGS' });
    expect(state.themeMode).toBe('system');
    expect(state.defaultView).toBe('today');
  });
});
