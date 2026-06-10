import type { Task, AppSettings, TaskTemplate } from '../types';
import { STORAGE_KEYS } from '../constants/storage';
import { APP_SCHEMA_VERSION } from '../constants/defaults';
import { getStorageItem, setStorageItem, loadTasks, loadSettings, loadTemplates } from './localStorage';
import { DEFAULT_SETTINGS } from '../types/settings';

export interface Migration {
  fromVersion: string;
  toVersion: string;
  migrate: (data: {
    tasks?: Task[];
    settings?: AppSettings;
    templates?: TaskTemplate[];
  }) => { tasks?: Task[]; settings?: AppSettings; templates?: TaskTemplate[] };
}

const migrations: Migration[] = [];

function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA !== numB) return numA - numB;
  }
  return 0;
}

export function runMigrations(): void {
  const currentVersion = getStorageItem<string>('version', '1.0');
  const targetVersion = APP_SCHEMA_VERSION;

  if (currentVersion === targetVersion) return;

  for (const migration of migrations) {
    if (
      compareVersions(currentVersion, migration.fromVersion) >= 0 &&
      compareVersions(currentVersion, migration.toVersion) < 0
    ) {
      const tasks = loadTasks();
      const settings = loadSettings() || DEFAULT_SETTINGS;
      const templates = loadTemplates();

      const migrated = migration.migrate({ tasks, settings, templates });

      if (migrated.tasks) setStorageItem('tasks', migrated.tasks);
      if (migrated.settings) setStorageItem('settings', migrated.settings);
      if (migrated.templates) setStorageItem('templates', migrated.templates);
    }
  }

  localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, targetVersion);
}

export function runMigrationsOnLoad(): void {
  try {
    runMigrations();
  } catch (e) {
    console.error('Migration failed:', e);
  }
}
