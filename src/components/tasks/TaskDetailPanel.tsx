import TaskForm from './TaskForm';
import type { Task } from '../../types';

interface TaskDetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export default function TaskDetailPanel({ open, onOpenChange, task }: TaskDetailPanelProps) {
  return (
    <TaskForm
      open={open}
      onOpenChange={onOpenChange}
      task={task}
    />
  );
}
