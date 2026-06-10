export const STORAGE_PREFIX = 'mini-daily-planner:';

export const STORAGE_KEYS = {
  TASKS: `${STORAGE_PREFIX}tasks`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  TEMPLATES: `${STORAGE_PREFIX}templates`,
  SCHEMA_VERSION: `${STORAGE_PREFIX}version`,
} as const;
