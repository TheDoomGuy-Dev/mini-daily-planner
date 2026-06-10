import { useMemo, useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { getTasksForDate, getCompletedCount, getCompletionPercentage } from '../../utils/taskUtils';
import { getTodayDateString } from '../../utils/dateUtils';
import CompletionStats from '../stats/CompletionStats';
import ProgressBar from '../stats/ProgressBar';
import TaskList from '../tasks/TaskList';
import FilterBar from '../filters/FilterBar';
import BulkActionBar from '../tasks/BulkActionBar';
import EmptyState from '../common/EmptyState';
import { Button } from '../ui/button';
import { Plus, ClipboardList } from 'lucide-react';
import TaskForm from '../tasks/TaskForm';

export default function TodayView() {
  const { state } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const today = getTodayDateString();

  const todayTasks = useMemo(
    () => getTasksForDate(state.tasks, today),
    [state.tasks, today],
  );

  const completedCount = getCompletedCount(todayTasks);
  const completionPercentage = getCompletionPercentage(todayTasks);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display text-foreground">Today</h1>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <CompletionStats completed={completedCount} total={todayTasks.length} />
        <ProgressBar value={completionPercentage} />
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Task List */}
      {todayTasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-16 w-16" />}
          title="No tasks for today"
          description="Add a task to get started!"
          action={
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          }
        />
      ) : (
        <>
          <BulkActionBar />
          <TaskList tasks={todayTasks} onAddTask={() => setIsFormOpen(true)} />
        </>
      )}

      {/* Floating Add Button */}
      {todayTasks.length > 0 && (
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-30"
          onClick={() => setIsFormOpen(true)}
          aria-label="Add task"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Task Form Modal */}
      <TaskForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        defaultDate={today}
      />
    </div>
  );
}
