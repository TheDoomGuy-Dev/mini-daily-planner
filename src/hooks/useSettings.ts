import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import type { SettingsState, SettingsAction } from '../types/settings';

export function useSettings(): { state: SettingsState; dispatch: React.Dispatch<SettingsAction> } {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
