import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { Button } from '../ui/button';
import { CheckCheck, Trash2, Copy } from 'lucide-react';
import ConfirmDialog from '../dialogs/ConfirmDialog';

export default function BulkActionBar() {
  const { state, dispatch } = useTasks();
  const { selectedIds } = state;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 bg-accent rounded-md border">
        <span className="text-sm font-medium text-foreground">
          {selectedIds.length} selected
        </span>
        <div className="flex gap-2 ml-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch({ type: 'BULK_COMPLETE' })}
            aria-label={`Mark ${selectedIds.length} tasks as complete`}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Complete
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch({ type: 'BULK_DUPLICATE' })}
            aria-label={`Duplicate ${selectedIds.length} tasks`}
          >
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label={`Delete ${selectedIds.length} tasks`}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: 'DESELECT_ALL' })}
        >
          Deselect all
        </Button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete ${selectedIds.length} tasks?`}
        message={`Are you sure you want to delete ${selectedIds.length} selected tasks? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={() => dispatch({ type: 'BULK_DELETE' })}
        variant="destructive"
      />
    </>
  );
}
