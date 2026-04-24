import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isConfirming?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  isDestructive = false,
  isConfirming = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent data-ocid="confirm_dialog.dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-ocid="confirm_dialog.cancel_button"
            onClick={onClose}
            disabled={isConfirming}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="confirm_dialog.confirm_button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={
              isDestructive
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                : ""
            }
          >
            {isConfirming ? "Processing..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
