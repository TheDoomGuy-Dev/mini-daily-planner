import { useEffect } from 'react';
import type { Task, TaskAction } from '../types';
import { REMINDER_CHECK_INTERVAL_MS } from '../constants/defaults';

export function useReminders(tasks: Task[], dispatch: React.Dispatch<TaskAction>) {
  // Check for missed reminders on mount
  useEffect(() => {
    const missed = tasks.filter(
      (task) =>
        task.reminder && !task.reminder.fired && new Date(task.reminder.time) <= new Date(),
    );
    missed.forEach((task) => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('Mini Daily Planner', {
            body: `Reminder: ${task.title}`,
            tag: task.id,
          });
        } catch {
          // Notification failed silently
        }
      }
      dispatch({ type: 'FIRE_REMINDER', payload: { id: task.id } });
    });
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic check for upcoming reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach((task) => {
        if (task.reminder && !task.reminder.fired) {
          const reminderTime = new Date(task.reminder.time);
          if (reminderTime <= now) {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              try {
                new Notification('Mini Daily Planner', {
                  body: `Reminder: ${task.title}`,
                  tag: task.id,
                });
              } catch {
                // Notification failed silently
              }
            }
            dispatch({ type: 'FIRE_REMINDER', payload: { id: task.id } });
          }
        }
      });
    };

    const intervalId = setInterval(checkReminders, REMINDER_CHECK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [tasks, dispatch]);
}
