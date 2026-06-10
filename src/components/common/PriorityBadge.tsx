import type { TaskPriority } from '../../types';
import { PRIORITY_CONFIG } from '../../constants/priorities';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  const variantMap: Record<TaskPriority, 'default' | 'warning' | 'success' | 'destructive'> = {
    high: 'destructive',
    medium: 'warning',
    low: 'success',
  };

  return (
    <Badge variant={variantMap[priority]} className={cn('text-xs font-medium', className)}>
      {config.label}
    </Badge>
  );
}
