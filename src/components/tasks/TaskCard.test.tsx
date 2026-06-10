import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskContext } from '../../context/TaskContext';
import TaskCard from './TaskCard';
import type { Task, TaskState } from '../../types';
import { INITIAL_TASK_STATE } from '../../types';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  date: '2026-06-10',
  priority: 'high',
  category: 'Work',
  completed: false,
  recurrence: null,
  reminder: null,
  position: 0,
  createdAt: '2026-06-10T00:00:00.000Z',
  updatedAt: '2026-06-10T00:00:00.000Z',
};

function renderWithContext(task: Task = mockTask) {
  const dispatch = vi.fn();
  const state: TaskState = { ...INITIAL_TASK_STATE, tasks: [task] };
  return {
    dispatch,
    ...render(
      <TaskContext.Provider value={{ state, dispatch }}>
        <TaskCard task={task} />
      </TaskContext.Provider>,
    ),
  };
}

describe('TaskCard', () => {
  it('renders task title', () => {
    renderWithContext();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('shows priority badge', () => {
    renderWithContext();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('dispatches TOGGLE_COMPLETE when checkbox is clicked', () => {
    const { dispatch } = renderWithContext();
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE_COMPLETE', payload: { id: '1' } });
  });

  it('shows strikethrough when completed', () => {
    const completedTask = { ...mockTask, completed: true };
    renderWithContext(completedTask);
    const title = screen.getByText('Test Task');
    expect(title.className).toContain('line-through');
  });
});
