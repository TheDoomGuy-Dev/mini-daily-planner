export interface AppSettings {
  themeMode: 'light' | 'dark' | 'system';
  defaultView: 'today' | 'upcoming';
  schemaVersion: number;
}

export interface SettingsState {
  themeMode: 'light' | 'dark' | 'system';
  defaultView: 'today' | 'upcoming';
  schemaVersion: number;
}

export const DEFAULT_SETTINGS: SettingsState = {
  themeMode: 'system',
  defaultView: 'today',
  schemaVersion: 1,
};

export type SettingsAction =
  | { type: 'SET_THEME_MODE'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_DEFAULT_VIEW'; payload: 'today' | 'upcoming' }
  | { type: 'RESET_SETTINGS' };
