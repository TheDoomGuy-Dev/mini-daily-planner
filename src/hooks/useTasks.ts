import { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';
import type { TaskState, TaskAction } from '../types/task';

export function useTasks(): { state: TaskState; dispatch: React.Dispatch<TaskAction> } {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
