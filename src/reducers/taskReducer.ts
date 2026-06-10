import type { TaskState, TaskAction, Task } from '../types/task';
import { generateId } from '../utils/idUtils';
import { generateNextRecurrenceInstance } from '../utils/recurrence';

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK': {
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    }

    case 'UPDATE_TASK': {
      const { id, updates } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task,
        ),
      };
    }

    case 'DELETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload.id),
        selectedIds: state.selectedIds.filter((id) => id !== action.payload.id),
      };
    }

    case 'TOGGLE_COMPLETE': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
            : task,
        ),
      };
    }

    case 'REORDER_TASKS': {
      const { taskId, overId } = action.payload;
      const draggedTask = state.tasks.find((t) => t.id === taskId);
      const overTask = state.tasks.find((t) => t.id === overId);
      if (!draggedTask || !overTask) return state;
      if (draggedTask.date !== overTask.date) return state;

      const targetDate = draggedTask.date;
      const dateGroupTasks = state.tasks
        .filter((t) => t.date === targetDate)
        .sort((a, b) => a.position - b.position);

      const oldIndex = dateGroupTasks.findIndex((t) => t.id === taskId);
      const newIndex = dateGroupTasks.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;

      const reordered = [...dateGroupTasks];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      const updatedDateGroup = reordered.map((task, index) => ({
        ...task,
        position: index,
      }));

      const newTasks = state.tasks.map((task) => {
        if (task.date === targetDate) {
          const updated = updatedDateGroup.find((t) => t.id === task.id);
          return updated ?? task;
        }
        return task;
      });

      return { ...state, tasks: newTasks };
    }

    case 'TOGGLE_SELECT': {
      const { id } = action.payload;
      return {
        ...state,
        selectedIds: state.selectedIds.includes(id)
          ? state.selectedIds.filter((sid) => sid !== id)
          : [...state.selectedIds, id],
      };
    }

    case 'SELECT_ALL': {
      return {
        ...state,
        selectedIds: state.tasks.map((t) => t.id),
      };
    }

    case 'DESELECT_ALL': {
      return {
        ...state,
        selectedIds: [],
      };
    }

    case 'BULK_COMPLETE': {
      if (state.selectedIds.length === 0) return state;
      const allAlreadyComplete = state.selectedIds.every((id) => {
        const task = state.tasks.find((t) => t.id === id);
        return task?.completed === true;
      });
      if (allAlreadyComplete) return state;

      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (state.selectedIds.includes(task.id) && !task.completed) {
            return { ...task, completed: true, updatedAt: new Date().toISOString() };
          }
          return task;
        }),
      };
    }

    case 'BULK_DELETE': {
      const selectedSet = new Set(state.selectedIds);
      return {
        ...state,
        tasks: state.tasks.filter((t) => !selectedSet.has(t.id)),
        selectedIds: [],
      };
    }

    case 'BULK_DUPLICATE': {
      const selectedSet = new Set(state.selectedIds);
      const newTasks: Task[] = state.tasks
        .filter((t) => selectedSet.has(t.id))
        .map((t) => ({
          ...t,
          id: generateId(),
          title: `${t.title} (copy)`,
          position: t.position + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completed: false,
        }));
      return {
        ...state,
        tasks: [...state.tasks, ...newTasks],
      };
    }

    case 'SET_FILTER': {
      return {
        ...state,
        filter: { ...state.filter, ...action.payload },
      };
    }

    case 'SET_SEARCH': {
      return {
        ...state,
        filter: { ...state.filter, searchQuery: action.payload },
      };
    }

    case 'CLEAR_FILTERS': {
      return {
        ...state,
        filter: {
          status: 'all',
          priority: 'all',
          category: 'all',
          searchQuery: '',
        },
      };
    }

    case 'SET_TASKS': {
      return {
        ...state,
        tasks: action.payload,
      };
    }

    case 'GENERATE_RECURRING': {
      const completedTask = state.tasks.find((t) => t.id === action.payload.completedTaskId);
      if (!completedTask || !completedTask.recurrence) return state;

      const newInstance = generateNextRecurrenceInstance(completedTask);
      if (!newInstance) return state;

      return {
        ...state,
        tasks: [...state.tasks, newInstance],
      };
    }

    case 'DUPLICATE_TASK': {
      const sourceTask = state.tasks.find((t) => t.id === action.payload.id);
      if (!sourceTask) return state;
      const newTask: Task = {
        ...sourceTask,
        id: generateId(),
        title: `${sourceTask.title} (copy)`,
        position: sourceTask.position + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: false,
      };
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };
    }

    case 'FIRE_REMINDER': {
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.id && task.reminder) {
            return {
              ...task,
              reminder: { ...task.reminder, fired: true },
            };
          }
          return task;
        }),
      };
    }

    case 'UPDATE_RECURRING_SERIES': {
      const { taskId, updates } = action.payload;
      const sourceTask = state.tasks.find((t) => t.id === taskId);
      if (!sourceTask || !sourceTask.recurrence) return state;

      const recurrenceKey = JSON.stringify(sourceTask.recurrence);

      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.recurrence && JSON.stringify(task.recurrence) === recurrenceKey) {
            return { ...task, ...updates, updatedAt: new Date().toISOString() };
          }
          return task;
        }),
      };
    }

    default:
      return state;
  }
}
