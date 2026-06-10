import type { Task, ExportData } from '../types';
import { isValidDateString } from './dateUtils';
import { VALID_PRIORITIES } from '../constants/priorities';

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  errorMessages: string[];
}

export function exportTasks(tasks: Task[]): ExportData {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    tasks: tasks.map((t) => ({ ...t })),
  };
}

export function downloadExport(data: ExportData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mini-daily-planner-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateImportData(jsonString: string): { valid: boolean; error?: string; data?: ExportData } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { valid: false, error: 'Invalid file format: The file is not valid JSON.' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { valid: false, error: 'Invalid file format: Expected a JSON object at the root.' };
  }

  const data = parsed as Record<string, unknown>;

  if (!Array.isArray(data.tasks)) {
    return { valid: false, error: "Invalid file format: Expected a 'tasks' array at the root." };
  }

  // Validate each task minimally
  for (let i = 0; i < data.tasks.length; i++) {
    const task = data.tasks[i] as Record<string, unknown>;
    if (!task.id || typeof task.id !== 'string') {
      return { valid: false, error: `Invalid file format: Task at index ${i} is missing required field 'id'.` };
    }
    if (!task.title || typeof task.title !== 'string') {
      return { valid: false, error: `Invalid file format: Task at index ${i} is missing required field 'title'.` };
    }
    if (!task.date || typeof task.date !== 'string') {
      return { valid: false, error: `Invalid file format: Task at index ${i} is missing required field 'date'.` };
    }
    if (!task.priority || typeof task.priority !== 'string') {
      return { valid: false, error: `Invalid file format: Task at index ${i} is missing required field 'priority'.` };
    }
    if (typeof task.title === 'string' && task.title.trim().length === 0) {
      return { valid: false, error: `Invalid file format: Task at index ${i} has an empty title.` };
    }
    if (!isValidDateString(task.date as string)) {
      return { valid: false, error: `Invalid file format: Task at index ${i} has an invalid date format.` };
    }
    if (!isValidPriority(task.priority as string)) {
      return { valid: false, error: `Invalid file format: Task at index ${i} has an invalid priority value.` };
    }
  }

  return { valid: true, data: { version: data.version as string || '1.0', exportDate: data.exportDate as string || new Date().toISOString(), tasks: data.tasks as Task[] } };
}

export function mergeImportedTasks(importedTasks: Task[], existingTasks: Task[]): ImportResult & { merged: Task[] } {
  const existingIds = new Set(existingTasks.map((t) => t.id));
  const merged: Task[] = [...existingTasks];
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const errorMessages: string[] = [];

  for (const task of importedTasks) {
    try {
      if (existingIds.has(task.id)) {
        skipped++;
        continue;
      }

      // Process reminder - if time is in the past, mark as fired
      if (task.reminder && task.reminder.time) {
        const reminderTime = new Date(task.reminder.time);
        if (reminderTime.getTime() <= Date.now()) {
          task.reminder.fired = true;
          task.reminder.source = 'import';
        }
      }

      merged.push(task);
      existingIds.add(task.id);
      imported++;
    } catch {
      errors++;
      errorMessages.push(`Failed to process task: ${task.title || 'unknown'}`);
    }
  }

  return { imported, skipped, errors, errorMessages, merged };
}

export function isValidPriority(value: string): value is 'high' | 'medium' | 'low' {
  return VALID_PRIORITIES.includes(value as 'high' | 'medium' | 'low');
}
