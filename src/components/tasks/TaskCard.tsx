import { useState, useRef, useEffect } from 'react';
import type { Task } from '../../types';
import { useTasks } from '../../hooks/useTasks';
import { useTemplates } from '../../hooks/useTemplates';
import PriorityBadge from '../common/PriorityBadge';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreHorizontal, Bell, BellOff, RotateCcw, Trash2, Edit3, Save, Copy, FileText } from 'lucide-react';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import RecurringEditPrompt from '../dialogs/RecurringEditPrompt';
import { cn } from '../../lib/utils';
import { formatTimeForDisplay } from '../../utils/dateUtils';
import { getRecurrenceDescription } from '../../utils/recurrence';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export default function TaskCard({ task, isDragging }: TaskCardProps) {
  const { dispatch } = useTasks();
  const { addTemplate } = useTemplates();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRecurringEdit, setShowRecurringEdit] = useState(false);
  const [recurringEditScope, setRecurringEditScope] = useState<'this' | 'all' | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isEditingDescription]);

  const handleToggleComplete = () => {
    dispatch({ type: 'TOGGLE_COMPLETE', payload: { id: task.id } });
    // If recurring, generate next instance
    if (!task.completed && task.recurrence) {
      dispatch({ type: 'GENERATE_RECURRING', payload: { completedTaskId: task.id } });
    }
  };

  const saveTitle = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      const updates: Partial<Task> = { title: editTitle.trim() };
      if (recurringEditScope === 'all') {
        // For "All Occurrences", the edit propagates to this task (the series definition),
        // so future generated instances will inherit the change via GENERATE_RECURRING.
        dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, updates } });
      } else {
        dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, updates } });
      }
    } else {
      setEditTitle(task.title);
    }
    setIsEditingTitle(false);
    setRecurringEditScope(null);
  };

  const saveDescription = () => {
    if (editDescription !== task.description) {
      dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, updates: { description: editDescription } } });
    }
    setIsEditingDescription(false);
  };

  return (
    <>
    <div
      className={cn(
        'group relative rounded-lg border bg-card p-4 transition-all',
        isDragging ? 'opacity-50 shadow-lg scale-95' : 'hover:shadow-sm',
        task.completed && 'opacity-75',
      )}
      data-testid="task-card"
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="flex items-center gap-2 pt-0.5">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleToggleComplete}
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row: Title + Badges */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <Input
                  ref={titleInputRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTitle();
                    if (e.key === 'Escape') {
                      setEditTitle(task.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="h-8 text-card-title"
                />
              ) : (
                <h3
                  className={cn(
                    'text-card-title cursor-pointer hover:text-primary transition-colors',
                    task.completed && 'line-through text-muted-foreground',
                  )}
                  onClick={() => !task.completed && setIsEditingTitle(true)}
                  title="Click to edit"
                >
                  {task.title}
                </h3>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <PriorityBadge priority={task.priority} />

              {/* Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Task actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => {
                    if (task.recurrence) {
                      setShowRecurringEdit(true);
                    } else {
                      setIsEditingTitle(true);
                    }
                  }}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleComplete}>
                    <Save className="h-4 w-4 mr-2" />
                    {task.completed ? 'Mark incomplete' : 'Mark complete'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => dispatch({ type: 'DUPLICATE_TASK', payload: { id: task.id } })}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    addTemplate({
                      name: task.title,
                      description: task.description,
                      priority: task.priority,
                      category: task.category,
                      recurrence: task.recurrence,
                    });
                  }}>
                    <FileText className="h-4 w-4 mr-2" />
                    Save as Template
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Description */}
          <div className="mt-1">
            {isEditingDescription ? (
              <Textarea
                ref={descriptionInputRef}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onBlur={saveDescription}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditDescription(task.description);
                    setIsEditingDescription(false);
                  }
                }}
                className="mt-1 text-sm min-h-[60px]"
                placeholder="Add description..."
              />
            ) : (
              <p
                className={cn(
                  'text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors line-clamp-2',
                  task.completed && 'opacity-60',
                )}
                onClick={() => !task.completed && setIsEditingDescription(true)}
              >
                {task.description || 'Add description...'}
              </p>
            )}
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {task.category && (
              <Badge variant="secondary" className="text-xs">
                {task.category}
              </Badge>
            )}

            {task.reminder && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {task.reminder.fired ? (
                  <BellOff className="h-3 w-3" />
                ) : (
                  <Bell className="h-3 w-3 text-primary" />
                )}
                {task.reminder.time && formatTimeForDisplay(task.reminder.time)}
              </span>
            )}

            {task.recurrence && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <RotateCcw className="h-3 w-3" />
                {getRecurrenceDescription(task.recurrence)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      title="Delete task?"
      message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={() => dispatch({ type: 'DELETE_TASK', payload: { id: task.id } })}
      variant="destructive"
    />

      <RecurringEditPrompt
        open={showRecurringEdit}
        onOpenChange={setShowRecurringEdit}
        onThisOccurrence={() => {
          setIsEditingTitle(true);
        }}
        onAllOccurrences={() => {
          dispatch({
            type: 'UPDATE_RECURRING_SERIES',
            payload: { taskId: task.id, updates: { title: editTitle } },
          });
          setShowRecurringEdit(false);
        }}
      />
    </>);
}
