import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant =
  | "paid"
  | "pending"
  | "overdue"
  | "partial"
  | "present"
  | "absent"
  | "late"
  | "halfDay"
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info";

const variantClasses: Record<BadgeVariant, string> = {
  paid: "bg-accent/15 text-accent border-accent/30",
  pending: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  overdue: "bg-destructive/15 text-destructive border-destructive/30",
  partial: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  present: "bg-accent/15 text-accent border-accent/30",
  absent: "bg-destructive/15 text-destructive border-destructive/30",
  late: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  halfDay: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  default: "bg-muted text-muted-foreground border-border",
  success: "bg-accent/15 text-accent border-accent/30",
  warning: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  error: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-primary/15 text-primary border-primary/30",
};

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function StatusBadge({
  variant = "default",
  children,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function getPaymentVariant(status: string): BadgeVariant {
  switch (status) {
    case "paid":
      return "paid";
    case "pending":
      return "pending";
    case "overdue":
      return "overdue";
    case "partial":
      return "partial";
    default:
      return "default";
  }
}

export function getAttendanceVariant(status: string): BadgeVariant {
  switch (status) {
    case "present":
      return "present";
    case "absent":
      return "absent";
    case "late":
      return "late";
    case "halfDay":
      return "halfDay";
    default:
      return "default";
  }
}
