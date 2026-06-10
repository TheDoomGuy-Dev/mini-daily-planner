import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TemplateCard from './TemplateCard';
import type { TaskTemplate } from '../../types';

const mockTemplate: TaskTemplate = {
  id: '1',
  name: 'Code Review',
  description: 'Review PR #42',
  priority: 'high',
  category: 'Development',
  recurrence: null,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

describe('TemplateCard', () => {
  it('renders template name and priority', () => {
    render(
      <TemplateCard template={mockTemplate} onUse={() => {}} onEdit={() => {}} onDelete={() => {}} />,
    );
    expect(screen.getByText('Code Review')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('calls onUse when Use Template is clicked', () => {
    const onUse = vi.fn();
    render(
      <TemplateCard template={mockTemplate} onUse={onUse} onEdit={() => {}} onDelete={() => {}} />,
    );
    fireEvent.click(screen.getByText('Use Template'));
    expect(onUse).toHaveBeenCalledTimes(1);
  });
});
