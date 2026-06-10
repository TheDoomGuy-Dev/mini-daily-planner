import type { Task } from '../../types';
import TaskCard from './TaskCard';

interface TaskSortableProps {
  task: Task;
  isDragging?: boolean;
}

export default function TaskSortable({ task, isDragging }: TaskSortableProps) {
  return <TaskCard task={task} isDragging={isDragging} />;
}
