import { STORAGE_PREFIX, STORAGE_KEYS } from '../constants/storage';
import type { Task, AppSettings, TaskTemplate } from '../types';

export class StorageQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

export class StorageUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageUnavailableError';
  }
}

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new StorageQuotaError('Storage is full. Please export and clear some data to continue.');
    }
    throw new StorageUnavailableError('Unable to save data. Storage is unavailable.');
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Silently fail on remove
  }
}

export function clearAllStorage(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
  keys.forEach(k => localStorage.removeItem(k));
}

export function safeParseTaskData(raw: string | null): Task[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item: unknown): item is Task =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Task).id === 'string' &&
        typeof (item as Task).title === 'string' &&
        typeof (item as Task).date === 'string' &&
        typeof (item as Task).priority === 'string',
    );
  } catch {
    console.error('Failed to parse task data from localStorage');
    return [];
  }
}

export function loadTasks(): Task[] {
  return safeParseTaskData(localStorage.getItem(STORAGE_KEYS.TASKS));
}

export function saveTasks(tasks: Task[]): void {
  setStorageItem('tasks', tasks);
}

export function loadSettings(): AppSettings | null {
  return getStorageItem<AppSettings | null>('settings', null);
}

export function saveSettings(settings: AppSettings): void {
  setStorageItem('settings', settings);
}

export function loadTemplates(): TaskTemplate[] {
  return getStorageItem<TaskTemplate[]>('templates', []);
}

export function saveTemplates(templates: TaskTemplate[]): void {
  setStorageItem('templates', templates);
}
