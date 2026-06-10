import { parseISO, isValid, isToday, format, isBefore, startOfDay } from 'date-fns';
import { VALID_PRIORITIES } from '../constants/priorities';

export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const parsed = parseISO(dateStr);
  return isValid(parsed);
}

export function isValidFutureDateTime(dateTimeStr: string): boolean {
  const parsed = new Date(dateTimeStr);
  return isValid(parsed) && parsed.getTime() > Date.now();
}

export function isValidPriority(value: string): value is 'high' | 'medium' | 'low' {
  return VALID_PRIORITIES.includes(value as 'high' | 'medium' | 'low');
}

export function formatDateForDisplay(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, 'EEEE, MMMM d, yyyy');
}

export function formatDateShort(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, 'MMM d, yyyy');
}

export function formatTime(dateTimeStr: string): string {
  const date = new Date(dateTimeStr);
  if (!isValid(date)) return dateTimeStr;
  return format(date, 'h:mm a');
}

export function formatTimeForDisplay(dateTimeStr: string): string {
  const date = new Date(dateTimeStr);
  if (!isValid(date)) return '';
  return format(date, 'h:mm a');
}

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function isDateToday(dateStr: string): boolean {
  const date = parseISO(dateStr);
  return isValid(date) && isToday(date);
}

export function isDatePast(dateStr: string): boolean {
  const date = parseISO(dateStr);
  if (!isValid(date)) return false;
  return isBefore(startOfDay(date), startOfDay(new Date()));
}

export function isDateFuture(dateStr: string): boolean {
  const date = parseISO(dateStr);
  if (!isValid(date)) return false;
  return date > startOfDay(new Date());
}

export function formatDateGroup(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  const today = new Date();
  const startOfToday = startOfDay(today);
  const targetDate = startOfDay(date);

  const diffDays = Math.round((targetDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 6) return format(date, 'EEEE');
  if (diffDays < 0 && diffDays >= -6) return `Last ${format(date, 'EEEE')}`;

  return format(date, 'EEEE, MMMM d, yyyy');
}
