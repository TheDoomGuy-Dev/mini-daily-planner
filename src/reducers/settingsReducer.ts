import type { SettingsState, SettingsAction } from '../types/settings';

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_THEME_MODE':
      return { ...state, themeMode: action.payload };
    case 'SET_DEFAULT_VIEW':
      return { ...state, defaultView: action.payload };
    case 'RESET_SETTINGS':
      return { themeMode: 'system', defaultView: 'today', schemaVersion: 1 };
    default:
      return state;
  }
}
