import { describe, it, expect } from 'vitest';
import { taskReducer } from './taskReducer';
import type { TaskState, Task } from '../types/task';
import { INITIAL_TASK_STATE } from '../types/task';

function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id || 'test-id',
    title: overrides.title || 'Test Task',
    description: overrides.description || '',
    date: overrides.date || '2026-06-10',
    priority: overrides.priority || 'medium',
    category: overrides.category || '',
    completed: overrides.completed || false,
    recurrence: overrides.recurrence || null,
    reminder: overrides.reminder || null,
    position: overrides.position ?? 0,
    createdAt: overrides.createdAt || '2026-06-10T00:00:00.000Z',
    updatedAt: overrides.updatedAt || '2026-06-10T00:00:00.000Z',
  };
}

describe('taskReducer', () => {
  it('should handle ADD_TASK', () => {
    const task = createMockTask({ id: '1', title: 'New Task' });
    const state = taskReducer(INITIAL_TASK_STATE, { type: 'ADD_TASK', payload: task });
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].title).toBe('New Task');
  });

  it('should handle UPDATE_TASK', () => {
    const task = createMockTask({ id: '1' });
    const initialState: TaskState = { ...INITIAL_TASK_STATE, tasks: [task] };
    const state = taskReducer(initialState, {
      type: 'UPDATE_TASK',
      payload: { id: '1', updates: { title: 'Updated' } },
    });
    expect(state.tasks[0].title).toBe('Updated');
  });

  it('should handle DELETE_TASK', () => {
    const task = createMockTask({ id: '1' });
    const initialState: TaskState = { ...INITIAL_TASK_STATE, tasks: [task] };
    const state = taskReducer(initialState, { type: 'DELETE_TASK', payload: { id: '1' } });
    expect(state.tasks).toHaveLength(0);
  });

  it('should handle TOGGLE_COMPLETE', () => {
    const task = createMockTask({ id: '1', completed: false });
    const initialState: TaskState = { ...INITIAL_TASK_STATE, tasks: [task] };
    const state = taskReducer(initialState, { type: 'TOGGLE_COMPLETE', payload: { id: '1' } });
    expect(state.tasks[0].completed).toBe(true);
  });

  it('should handle TOGGLE_SELECT', () => {
    const initialState: TaskState = { ...INITIAL_TASK_STATE };
    const state = taskReducer(initialState, { type: 'TOGGLE_SELECT', payload: { id: '1' } });
    expect(state.selectedIds).toContain('1');
  });

  it('should handle SELECT_ALL and DESELECT_ALL', () => {
    const tasks = [createMockTask({ id: '1' }), createMockTask({ id: '2' })];
    const initialState: TaskState = { ...INITIAL_TASK_STATE, tasks };
    const selected = taskReducer(initialState, { type: 'SELECT_ALL' });
    expect(selected.selectedIds).toHaveLength(2);
    const deselected = taskReducer(selected, { type: 'DESELECT_ALL' });
    expect(deselected.selectedIds).toHaveLength(0);
  });

  it('should handle BULK_COMPLETE', () => {
    const tasks = [
      createMockTask({ id: '1', completed: false }),
      createMockTask({ id: '2', completed: false }),
    ];
    const initialState: TaskState = { ...INITIAL_TASK_STATE, tasks, selectedIds: ['1', '2'] };
    const state = taskReducer(initialState, { type: 'BULK_COMPLETE' });
    expect(state.tasks[0].completed).toBe(true);
    expect(state.tasks[1].completed).toBe(true);
  });

  it('should handle BULK_DELETE', () => {
    const tasks = [createMockTask({ id: '1' }), createMockTask({ id: '2' }), createMockTask({ id: '3' })];
    const initialState: TaskState = { ...INITIAL_TASK_STATE, tasks, selectedIds: ['1', '3'] };
    const state = taskReducer(initialState, { type: 'BULK_DELETE' });
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].id).toBe('2');
  });

  it('should handle BULK_DUPLICATE', () => {
    const task = createMockTask({ id: '1', title: 'Original' });
    const initialState: TaskState = { ...INITIAL_TASK_STATE, tasks: [task], selectedIds: ['1'] };
    const state = taskReducer(initialState, { type: 'BULK_DUPLICATE' });
    expect(state.tasks).toHaveLength(2);
    expect(state.tasks[1].title).toBe('Original (copy)');
  });

  it('should handle SET_FILTER', () => {
    const state = taskReducer(INITIAL_TASK_STATE, {
      type: 'SET_FILTER',
      payload: { status: 'active' },
    });
    expect(state.filter.status).toBe('active');
  });

  it('should handle CLEAR_FILTERS', () => {
    const filtered: TaskState = {
      ...INITIAL_TASK_STATE,
      filter: { status: 'active', priority: 'high', category: 'Work', searchQuery: 'test' },
    };
    const state = taskReducer(filtered, { type: 'CLEAR_FILTERS' });
    expect(state.filter.status).toBe('all');
    expect(state.filter.searchQuery).toBe('');
  });

  it('should handle REORDER_TASKS within same date', () => {
    const tasks = [
      createMockTask({ id: '1', date: '2026-06-10', position: 0 }),
      createMockTask({ id: '2', date: '2026-06-10', position: 1 }),
      createMockTask({ id: '3', date: '2026-06-10', position: 2 }),
    ];
    const initialState: TaskState = { ...INITIAL_TASK_STATE, tasks };
    const state = taskReducer(initialState, {
      type: 'REORDER_TASKS',
      payload: { taskId: '1', overId: '3' },
    });
    expect(state.tasks.find((t) => t.id === '1')?.position).toBeGreaterThanOrEqual(0);
  });

  it('should not reorder across different dates', () => {
    const tasks = [
      createMockTask({ id: '1', date: '2026-06-10', position: 0 }),
      createMockTask({ id: '2', date: '2026-06-11', position: 0 }),
    ];
    const initialState: TaskState = { ...INITIAL_TASK_STATE, tasks };
    const state = taskReducer(initialState, {
      type: 'REORDER_TASKS',
      payload: { taskId: '1', overId: '2' },
    });
    expect(state.tasks).toEqual(initialState.tasks);
  });
});
