import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

export function FormModal({
  open,
  onClose,
  title,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
  children,
  size = "md",
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="form_modal.dialog"
        className={sizeClasses[size]}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-2 max-h-[65vh] overflow-y-auto pr-1">{children}</div>
        <DialogFooter className="gap-2">
          <Button
            data-ocid="form_modal.cancel_button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            data-ocid="form_modal.submit_button"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
