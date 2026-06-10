import type { Task, FilterState } from '../types';
import { VALID_PRIORITIES } from '../constants/priorities';

export function isValidPriority(value: string): value is 'high' | 'medium' | 'low' {
  return VALID_PRIORITIES.includes(value as 'high' | 'medium' | 'low');
}

export function filterTasks(tasks: Task[], filter: FilterState): Task[] {
  return tasks.filter((task) => {
    // Status filter
    if (filter.status === 'active' && task.completed) return false;
    if (filter.status === 'completed' && !task.completed) return false;

    // Priority filter
    if (filter.priority !== 'all' && task.priority !== filter.priority) return false;

    // Category filter
    if (filter.category !== 'all' && task.category !== filter.category) return false;

    // Search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDescription = task.description.toLowerCase().includes(query);
      const matchesCategory = task.category.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription && !matchesCategory) return false;
    }

    return true;
  });
}

export function getTasksForDate(tasks: Task[], date: string): Task[] {
  return tasks
    .filter((t) => t.date === date)
    .sort((a, b) => a.position - b.position);
}

export function getCompletedCount(tasks: Task[]): number {
  return tasks.filter((t) => t.completed).length;
}

export function getCompletionPercentage(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((getCompletedCount(tasks) / tasks.length) * 100);
}

export function getAllCategories(tasks: Task[]): string[] {
  const categories = new Set(tasks.map((t) => t.category).filter(Boolean));
  return Array.from(categories).sort();
}

export function getDueDateStatus(task: Task): 'past' | 'today' | 'future' {
  const todayStr = new Date().toISOString().split('T')[0];
  if (task.date < todayStr) return 'past';
  if (task.date === todayStr) return 'today';
  return 'future';
}

export function validateTaskTitle(title: string): string | null {
  if (!title || title.trim().length === 0) return 'Title is required.';
  if (title.length > 200) return 'Title must be under 200 characters.';
  return null;
}

export function validateTaskDescription(description: string): string | null {
  if (description.length > 500) return 'Description must be under 500 characters.';
  return null;
}
