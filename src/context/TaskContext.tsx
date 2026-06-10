/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';
import type { TaskState, TaskAction } from '../types/task';
import { INITIAL_TASK_STATE } from '../types/task';
import { taskReducer } from '../reducers/taskReducer';
import { STORAGE_KEYS } from '../constants/storage';
import { safeParseTaskData } from '../utils/localStorage';
import { useReminders } from '../hooks/useReminders';

interface TaskContextValue {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
}

export const TaskContext = createContext<TaskContextValue | undefined>(undefined);

function initializeTasks(): TaskState {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    const tasks = safeParseTaskData(stored);
    return { ...INITIAL_TASK_STATE, tasks };
  } catch {
    return INITIAL_TASK_STATE;
  }
}

function dispatchToast(message: string, variant: 'default' | 'destructive' = 'destructive') {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, variant } }));
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, null, initializeTasks);

  // Wire up reminders/notifications
  useReminders(state.tasks, dispatch);

  // Sync tasks to localStorage (skip selectedIds and filter)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        dispatchToast('Storage quota exceeded. Some changes may not be saved.', 'destructive');
      } else {
        dispatchToast('Failed to save tasks. Changes may not persist.', 'destructive');
      }
    }
  }, [state.tasks]);

  // Cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.TASKS && e.newValue) {
        const tasks = safeParseTaskData(e.newValue);
        dispatch({ type: 'SET_TASKS', payload: tasks });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}
