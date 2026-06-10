import type { TaskPriority, RecurrenceRule } from './task';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  priority: TaskPriority;
  category: string;
  recurrence: RecurrenceRule | null;
  createdAt: string;
  updatedAt: string;
}
