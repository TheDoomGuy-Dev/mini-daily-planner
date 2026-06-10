import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

interface RecurringEditPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThisOccurrence: () => void;
  onAllOccurrences: () => void;
}

export default function RecurringEditPrompt({
  open,
  onOpenChange,
  onThisOccurrence,
  onAllOccurrences,
}: RecurringEditPromptProps) {
  const handleThisOccurrence = () => {
    onThisOccurrence();
    onOpenChange(false);
  };

  const handleAllOccurrences = () => {
    onAllOccurrences();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit recurring task</DialogTitle>
          <DialogDescription>
            Would you like to edit this occurrence only or all occurrences in the series?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={handleThisOccurrence}>
            This Occurrence
          </Button>
          <Button onClick={handleAllOccurrences}>
            All Occurrences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
