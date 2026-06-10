export type TaskPriority = 'high' | 'medium' | 'low';
export type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export const DAY_OF_WEEK_MAP: Record<DayOfWeek, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday',
};

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly';
  interval: number;
  daysOfWeek: DayOfWeek[] | null;
  endDate: string | null;
  maxOccurrences: number | null;
  occurrenceCount: number;
}

export interface Reminder {
  time: string;
  fired: boolean;
  source: 'manual' | 'import';
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: TaskPriority;
  category: string;
  completed: boolean;
  recurrence: RecurrenceRule | null;
  reminder: Reminder | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExportData {
  version: string;
  exportDate: string;
  tasks: Task[];
}

export interface FilterState {
  status: 'all' | 'active' | 'completed';
  priority: 'all' | TaskPriority;
  category: 'all' | string;
  searchQuery: string;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  status: 'all',
  priority: 'all',
  category: 'all',
  searchQuery: '',
};

export interface TaskState {
  tasks: Task[];
  selectedIds: string[];
  filter: FilterState;
}

export const INITIAL_TASK_STATE: TaskState = {
  tasks: [],
  selectedIds: [],
  filter: DEFAULT_FILTER_STATE,
};

export type TaskAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'TOGGLE_COMPLETE'; payload: { id: string } }
  | { type: 'REORDER_TASKS'; payload: { taskId: string; overId: string } }
  | { type: 'TOGGLE_SELECT'; payload: { id: string } }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'BULK_COMPLETE' }
  | { type: 'BULK_DELETE' }
  | { type: 'BULK_DUPLICATE' }
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'GENERATE_RECURRING'; payload: { completedTaskId: string } }
  | { type: 'FIRE_REMINDER'; payload: { id: string } }
  | { type: 'DUPLICATE_TASK'; payload: { id: string } }
  | { type: 'UPDATE_RECURRING_SERIES'; payload: { taskId: string; updates: Partial<Task> } };
