import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskContext } from '../../context/TaskContext';
import type { TaskState, TaskAction } from '../../types';
import { INITIAL_TASK_STATE } from '../../types';
import FilterBar from './FilterBar';

const mockDispatch = () => {};

function renderWithContext() {
  const state: TaskState = { ...INITIAL_TASK_STATE };
  const dispatch: React.Dispatch<TaskAction> = mockDispatch;
  return render(
    <TaskContext.Provider value={{ state, dispatch }}>
      <FilterBar />
    </TaskContext.Provider>,
  );
}

describe('FilterBar', () => {
  it('renders search input', () => {
    renderWithContext();
    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
  });
});
