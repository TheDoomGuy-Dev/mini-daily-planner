import { useReducer, useCallback } from 'react';
import type { TaskTemplate } from '../types';
import { generateId } from '../utils/idUtils';
import { getStorageItem, setStorageItem } from '../utils/localStorage';

interface TemplateState {
  templates: TaskTemplate[];
}

type TemplateAction =
  | { type: 'ADD_TEMPLATE'; payload: TaskTemplate }
  | { type: 'UPDATE_TEMPLATE'; payload: { id: string; updates: Partial<TaskTemplate> } }
  | { type: 'DELETE_TEMPLATE'; payload: { id: string } }
  | { type: 'SET_TEMPLATES'; payload: TaskTemplate[] };

function templateReducer(state: TemplateState, action: TemplateAction): TemplateState {
  switch (action.type) {
    case 'ADD_TEMPLATE': {
      const newTemplates = [...state.templates, action.payload];
      setStorageItem('templates', newTemplates);
      return { templates: newTemplates };
    }
    case 'UPDATE_TEMPLATE': {
      const newTemplates = state.templates.map((t) =>
        t.id === action.payload.id
          ? { ...t, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : t,
      );
      setStorageItem('templates', newTemplates);
      return { templates: newTemplates };
    }
    case 'DELETE_TEMPLATE': {
      const newTemplates = state.templates.filter((t) => t.id !== action.payload.id);
      setStorageItem('templates', newTemplates);
      return { templates: newTemplates };
    }
    case 'SET_TEMPLATES': {
      setStorageItem('templates', action.payload);
      return { templates: action.payload };
    }
    default:
      return state;
  }
}

function initializeTemplates(): TemplateState {
  const stored = getStorageItem<TaskTemplate[]>('templates', []);
  return { templates: stored };
}

export function useTemplates() {
  const [state, dispatch] = useReducer(templateReducer, null, initializeTemplates);

  const addTemplate = useCallback(
    (template: Omit<TaskTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newTemplate: TaskTemplate = {
        ...template,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_TEMPLATE', payload: newTemplate });
      return newTemplate;
    },
    [],
  );

  const updateTemplate = useCallback((id: string, updates: Partial<TaskTemplate>) => {
    dispatch({ type: 'UPDATE_TEMPLATE', payload: { id, updates } });
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', payload: { id } });
  }, []);

  return {
    templates: state.templates,
    dispatch,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
