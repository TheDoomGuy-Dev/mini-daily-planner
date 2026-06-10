interface CompletionStatsProps {
  completed: number;
  total: number;
}

export default function CompletionStats({ completed, total }: CompletionStatsProps) {
  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No tasks for today</p>;
  }

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = completed === total && total > 0;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {allDone ? (
          'All done!'
        ) : (
          <>
            <span className="font-medium text-foreground">{completed}</span> of{' '}
            <span className="font-medium text-foreground">{total}</span> tasks completed
          </>
        )}
      </p>
      <p className="text-sm font-semibold text-primary">{percentage}%</p>
    </div>
  );
}
