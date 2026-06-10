import type { Task, RecurrenceRule } from '../types';
import { DAY_OF_WEEK_LABELS } from '../types/task';
import { generateId } from './idUtils';
import { addDays, addWeeks, format, parseISO, isBefore } from 'date-fns';

export function getNextRecurrenceDate(task: Task): string | null {
  const { recurrence, date } = task;
  if (!recurrence) return null;

  const currentDate = parseISO(date);
  let nextDate: Date;

  if (recurrence.frequency === 'daily') {
    nextDate = addDays(currentDate, recurrence.interval);
  } else {
    // Weekly
    nextDate = addWeeks(currentDate, recurrence.interval);
  }

  // Check end date
  if (recurrence.endDate) {
    const end = parseISO(recurrence.endDate);
    if (isBefore(end, nextDate) || nextDate.getTime() === end.getTime()) return null;
  }

  // Check max occurrences
  if (recurrence.maxOccurrences !== null && recurrence.occurrenceCount >= recurrence.maxOccurrences) {
    return null;
  }

  return format(nextDate, 'yyyy-MM-dd');
}

export function generateNextRecurrenceInstance(completedTask: Task): Task | null {
  const { recurrence } = completedTask;
  if (!recurrence) return null;

  const nextDate = getNextRecurrenceDate(completedTask);
  if (!nextDate) return null;

  // Catch-up guard: if the next occurrence is in the past, skip to today or future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextOccurrence = parseISO(nextDate);
  const todayStr = format(today, 'yyyy-MM-dd');

  let adjustedDate = nextDate;
  if (isBefore(nextOccurrence, today) && nextDate !== todayStr) {
    const diffDays = Math.ceil((today.getTime() - nextOccurrence.getTime()) / (1000 * 60 * 60 * 24));
    const intervalsToSkip = Math.ceil(diffDays / (recurrence.interval || 1));
    let skipDate = nextOccurrence;
    for (let i = 0; i < intervalsToSkip; i++) {
      if (recurrence.frequency === 'daily') {
        skipDate = addDays(skipDate, recurrence.interval);
      } else {
        skipDate = addWeeks(skipDate, recurrence.interval);
      }
    }
    adjustedDate = format(skipDate, 'yyyy-MM-dd');
  }

  return {
    ...completedTask,
    id: generateId(),
    date: adjustedDate,
    completed: false,
    position: 0,
    reminder: completedTask.reminder ? { ...completedTask.reminder, fired: false } : null,
    recurrence: {
      ...recurrence,
      occurrenceCount: recurrence.occurrenceCount + 1,
    } as RecurrenceRule,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getRecurrenceDescription(rule: RecurrenceRule): string {
  const { frequency, interval, daysOfWeek } = rule;

  if (frequency === 'daily') {
    if (interval === 1) return 'Daily';
    return `Every ${interval} days`;
  }

  if (frequency === 'weekly') {
    if (interval === 1 && daysOfWeek && daysOfWeek.length > 0) {
      const dayLabels = daysOfWeek.map(d => DAY_OF_WEEK_LABELS[d].slice(0, 3));
      return `Weekly (${dayLabels.join(', ')})`;
    }
    if (interval === 1) return 'Weekly';
    if (daysOfWeek && daysOfWeek.length > 0) {
      const dayLabels = daysOfWeek.map(d => DAY_OF_WEEK_LABELS[d].slice(0, 3));
      return `Every ${interval} weeks (${dayLabels.join(', ')})`;
    }
    return `Every ${interval} weeks`;
  }

  return 'Repeating';
}
