import { useState, useEffect } from 'react';
import type { Task, TaskPriority, RecurrenceRule, DayOfWeek, Reminder } from '../../types';
import { useTasks } from '../../hooks/useTasks';
import { generateId } from '../../utils/idUtils';
import { getTodayDateString, isValidDateString } from '../../utils/dateUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { VALID_PRIORITIES } from '../../constants/priorities';
import { DAY_OF_WEEK_LABELS } from '../../types/task';

type RecurrenceMode = 'none' | 'daily' | 'weekly';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultDate?: string;
  templateValues?: {
    title: string;
    description: string;
    priority: TaskPriority;
    category: string;
    recurrence: RecurrenceRule | null;
  } | null;
}

interface FormData {
  title: string;
  description: string;
  date: string;
  priority: TaskPriority;
  category: string;
  recurrenceMode: RecurrenceMode;
  recurrenceInterval: number;
  recurrenceDaysOfWeek: DayOfWeek[];
  recurrenceEndDate: string;
  reminderTime: string;
}

const initialState: FormData = {
  title: '',
  description: '',
  date: getTodayDateString(),
  priority: 'medium',
  category: '',
  recurrenceMode: 'none',
  recurrenceInterval: 1,
  recurrenceDaysOfWeek: [],
  recurrenceEndDate: '',
  reminderTime: '',
};

const ALL_DAYS: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function TaskForm({ open, onOpenChange, task, defaultDate, templateValues }: TaskFormProps) {
  const { dispatch } = useTasks();
  const [formData, setFormData] = useState<FormData>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = !!task;

  useEffect(() => {
    if (open) {
      if (task) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setFormData({
          title: task.title,
          description: task.description,
          date: task.date,
          priority: task.priority,
          category: task.category,
          recurrenceMode: task.recurrence?.frequency ?? 'none',
          recurrenceInterval: task.recurrence?.interval ?? 1,
          recurrenceDaysOfWeek: task.recurrence?.daysOfWeek ?? [],
          recurrenceEndDate: task.recurrence?.endDate ?? '',
          reminderTime: task.reminder?.time ?? '',
        });
        /* eslint-enable react-hooks/set-state-in-effect */
      } else if (templateValues) {
        setFormData({
          ...initialState,
          title: templateValues.title,
          description: templateValues.description,
          priority: templateValues.priority,
          category: templateValues.category,
          recurrenceMode: templateValues.recurrence?.frequency ?? 'none',
          recurrenceInterval: templateValues.recurrence?.interval ?? 1,
          recurrenceDaysOfWeek: templateValues.recurrence?.daysOfWeek ?? [],
          recurrenceEndDate: templateValues.recurrence?.endDate ?? '',
          date: defaultDate || getTodayDateString(),
        });
      } else {
        setFormData({
          ...initialState,
          date: defaultDate || getTodayDateString(),
        });
      }
      setErrors({});
    }
  }, [open, task, defaultDate, templateValues]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required.';
    if (formData.title.length > 200) newErrors.title = 'Title must be under 200 characters.';
    if (formData.description.length > 500) newErrors.description = 'Description must be under 500 characters.';
    if (!formData.date || !isValidDateString(formData.date)) newErrors.date = 'Date is required.';
    if (formData.recurrenceMode !== 'none' && formData.recurrenceInterval < 1) {
      newErrors.recurrenceInterval = 'Interval must be at least 1.';
    }
    if (formData.recurrenceMode === 'weekly' && formData.recurrenceDaysOfWeek.length === 0) {
      newErrors.recurrenceDaysOfWeek = 'Select at least one day.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildRecurrence = (): RecurrenceRule | null => {
    if (formData.recurrenceMode === 'none') return null;
    return {
      frequency: formData.recurrenceMode,
      interval: formData.recurrenceInterval,
      daysOfWeek: formData.recurrenceMode === 'weekly' ? formData.recurrenceDaysOfWeek : null,
      endDate: formData.recurrenceEndDate || null,
      maxOccurrences: null,
      occurrenceCount: task?.recurrence?.occurrenceCount ?? 0,
    };
  };

  const buildReminder = (): Reminder | null => {
    if (!formData.reminderTime) return null;
    return {
      time: formData.reminderTime,
      fired: false,
      source: 'manual',
    };
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const recurrence = buildRecurrence();
    const reminder = buildReminder();

    if (isEditing && task) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          id: task.id,
          updates: {
            title: formData.title.trim(),
            description: formData.description,
            date: formData.date,
            priority: formData.priority,
            category: formData.category.trim(),
            recurrence,
            reminder,
          },
        },
      });
    } else {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: generateId(),
        title: formData.title.trim(),
        description: formData.description,
        date: formData.date,
        priority: formData.priority,
        category: formData.category.trim(),
        completed: false,
        recurrence,
        reminder,
        position: 0,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_TASK', payload: newTask });
    }

    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-visible" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              autoFocus
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description (optional)"
              rows={3}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Date and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Work, Personal, Health"
            />
          </div>

          {/* Reminder */}
          <div className="space-y-2">
            <Label htmlFor="reminderTime">Reminder</Label>
            <Input
              id="reminderTime"
              type="datetime-local"
              value={formData.reminderTime}
              onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Leave empty for no reminder.</p>
          </div>

          {/* Recurrence */}
          <div className="space-y-3 rounded-lg border p-4">
            <Label>Recurrence</Label>

            <Select
              value={formData.recurrenceMode}
              onValueChange={(value: RecurrenceMode) =>
                setFormData({ ...formData, recurrenceMode: value, recurrenceDaysOfWeek: value === 'weekly' ? formData.recurrenceDaysOfWeek : [] })
              }
            >
              <SelectTrigger id="recurrenceMode">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>

            {formData.recurrenceMode !== 'none' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="recurrenceInterval">Every (interval)</Label>
                  <Input
                    id="recurrenceInterval"
                    type="number"
                    min={1}
                    max={365}
                    value={formData.recurrenceInterval}
                    onChange={(e) =>
                      setFormData({ ...formData, recurrenceInterval: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                  />
                  {errors.recurrenceInterval && (
                    <p className="text-xs text-destructive">{errors.recurrenceInterval}</p>
                  )}
                </div>

                {formData.recurrenceMode === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Repeat on</Label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_DAYS.map((day) => (
                        <label
                          key={day}
                          className="flex items-center gap-1.5 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={formData.recurrenceDaysOfWeek.includes(day)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  recurrenceDaysOfWeek: [...formData.recurrenceDaysOfWeek, day],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  recurrenceDaysOfWeek: formData.recurrenceDaysOfWeek.filter((d) => d !== day),
                                });
                              }
                            }}
                          />
                          {DAY_OF_WEEK_LABELS[day].slice(0, 3)}
                        </label>
                      ))}
                    </div>
                    {errors.recurrenceDaysOfWeek && (
                      <p className="text-xs text-destructive">{errors.recurrenceDaysOfWeek}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="recurrenceEndDate">End date (optional)</Label>
                  <Input
                    id="recurrenceEndDate"
                    type="date"
                    value={formData.recurrenceEndDate}
                    onChange={(e) => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
