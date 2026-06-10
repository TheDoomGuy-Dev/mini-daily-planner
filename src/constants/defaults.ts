import type { SettingsState } from '../types/settings';

export const APP_NAME = 'Mini Daily Planner';
export const APP_VERSION = '1.0.0';
export const APP_SCHEMA_VERSION = '1.0';

export const DEFAULT_SETTINGS: SettingsState = {
  themeMode: 'system',
  defaultView: 'today',
  schemaVersion: 1,
};

export const STORAGE_QUOTA_ERROR_MESSAGE = 'Storage is full. Please export and clear some data to continue.';
export const STORAGE_UNAVAILABLE_MESSAGE = 'Unable to save data. Storage is unavailable.';

export const DEBOUNCE_MS = 150;
export const REMINDER_CHECK_INTERVAL_MS = 30_000;
export const TOAST_DURATION_MS = 3_000;
export const TOAST_ERROR_DURATION_MS = 5_000;

export const CONTENT_MAX_WIDTH = 800;
export const NAV_HEIGHT = 56;
