import { useMemo, useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { filterTasks } from '../../utils/taskUtils';
import { isDatePast, formatDateGroup } from '../../utils/dateUtils';
import TaskList from '../tasks/TaskList';
import FilterBar from '../filters/FilterBar';
import BulkActionBar from '../tasks/BulkActionBar';
import EmptyState from '../common/EmptyState';
import { Button } from '../ui/button';
import { ChevronDown, ChevronRight, Calendar, AlertTriangle, Plus } from 'lucide-react';
import TaskForm from '../tasks/TaskForm';

export default function UpcomingView() {
  const { state } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Group tasks by date (combined filtered + grouping in one useMemo)
  const grouped = useMemo(() => {
    const filtered = filterTasks(state.tasks, state.filter);
    const pastDue: { date: string; tasks: typeof state.tasks }[] = [];
    const upcoming: { date: string; tasks: typeof state.tasks }[] = [];
    const dateMap = new Map<string, typeof state.tasks>();

    filtered.forEach((task) => {
      const existing = dateMap.get(task.date) || [];
      existing.push(task);
      dateMap.set(task.date, existing);
    });

    dateMap.forEach((tasks, date) => {
      tasks.sort((a, b) => a.position - b.position);
      if (isDatePast(date)) {
        pastDue.push({ date, tasks });
      } else {
        upcoming.push({ date, tasks });
      }
    });

    pastDue.sort((a, b) => a.date.localeCompare(b.date));
    upcoming.sort((a, b) => a.date.localeCompare(b.date));

    return { pastDue, upcoming };
  }, [state]);

  const toggleGroup = (date: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const hasTasks = grouped.pastDue.length > 0 || grouped.upcoming.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-display text-foreground">Upcoming</h1>

      <FilterBar />

      {!hasTasks ? (
        <EmptyState
          icon={<Calendar className="h-16 w-16" />}
          title="No upcoming tasks"
          description="Tasks scheduled for future dates will appear here."
        />
      ) : (
        <>
          <BulkActionBar />

          {/* Past Due Group */}
          {grouped.pastDue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-section text-warning">Past Due</h2>
              </div>
              {grouped.pastDue.map((group) => (
                <div key={group.date} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group.date)}
                    className="flex items-center gap-2 py-2 w-full text-left"
                    aria-expanded={!collapsedGroups.has(group.date)}
                  >
                    {collapsedGroups.has(group.date) ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{formatDateGroup(group.date)}</span>
                    <span className="text-xs text-muted-foreground">({group.tasks.length})</span>
                  </button>
                  {!collapsedGroups.has(group.date) && (
                    <TaskList tasks={group.tasks} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Groups */}
          {grouped.upcoming.map((group) => (
            <div key={group.date} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.date)}
                className="flex items-center gap-2 py-2 w-full text-left border-b border-border"
                aria-expanded={!collapsedGroups.has(group.date)}
              >
                {collapsedGroups.has(group.date) ? (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{formatDateGroup(group.date)}</span>
                <span className="text-xs text-muted-foreground">({group.tasks.length})</span>
              </button>
              {!collapsedGroups.has(group.date) && (
                <div className="pl-4">
                  <TaskList tasks={group.tasks} />
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Add Task Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-30"
        onClick={() => setIsFormOpen(true)}
        aria-label="Add task"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <TaskForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </div>
  );
}
