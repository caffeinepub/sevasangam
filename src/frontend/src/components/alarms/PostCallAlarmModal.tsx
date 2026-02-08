import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Bell } from 'lucide-react';
import { useAlarmSound } from './useAlarmSound';

interface PostCallAlarmModalProps {
  open: boolean;
  onDismiss: () => void;
}

export default function PostCallAlarmModal({ open, onDismiss }: PostCallAlarmModalProps) {
  // Play alarm sound when modal opens
  useAlarmSound(open);

  // Prevent closing via Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <DialogTitle className="text-center text-xl">Service Reminder</DialogTitle>
          <DialogDescription className="text-center text-base">
            Don't forget to visit the customer's location to provide the service!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onDismiss} size="lg" className="w-full sm:w-auto px-12">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
