import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface ImportSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imported: number;
  skipped: number;
  errors: number;
  errorMessages?: string[];
}

export default function ImportSummaryDialog({
  open,
  onOpenChange,
  imported,
  skipped,
  errors,
  errorMessages,
}: ImportSummaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Import Summary</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-sm">{imported} tasks imported</span>
          </div>
          {skipped > 0 && (
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <span className="text-sm">{skipped} tasks skipped (already exist)</span>
            </div>
          )}
          {errors > 0 && (
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-sm">{errors} tasks with errors</span>
            </div>
          )}
          {errorMessages && errorMessages.length > 0 && (
            <div className="mt-2 space-y-1">
              {errorMessages.map((msg, i) => (
                <p key={i} className="text-xs text-destructive">{msg}</p>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
