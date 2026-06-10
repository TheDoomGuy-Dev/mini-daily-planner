import type { TaskPriority } from '../types/task';

export const VALID_PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];

export const PRIORITY_CONFIG: Record<TaskPriority, {
  label: string;
  color: string;
  hsl: string;
  order: number;
}> = {
  high: {
    label: 'High',
    color: 'text-red-500 bg-red-50 dark:bg-red-950',
    hsl: 'hsl(var(--priority-high))',
    order: 1,
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    hsl: 'hsl(var(--priority-medium))',
    order: 2,
  },
  low: {
    label: 'Low',
    color: 'text-green-500 bg-green-50 dark:bg-green-950',
    hsl: 'hsl(var(--priority-low))',
    order: 3,
  },
};

export function getPriorityLabel(priority: TaskPriority): string {
  return PRIORITY_CONFIG[priority].label;
}

export function getPriorityColor(priority: TaskPriority): string {
  return PRIORITY_CONFIG[priority].color;
}
