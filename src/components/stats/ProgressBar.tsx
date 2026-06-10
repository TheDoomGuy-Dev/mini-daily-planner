import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
}

export default function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div
      className={cn('h-2 w-full rounded-full bg-secondary overflow-hidden', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${value}% completed`}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300 ease-in-out',
          value === 100 ? 'bg-success' : 'bg-primary',
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
