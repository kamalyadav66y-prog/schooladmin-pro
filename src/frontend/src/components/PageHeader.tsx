import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3 sm:mt-0">
        {children}
        {action && (
          <Button
            data-ocid="page_header.primary_button"
            onClick={action.onClick}
            className="gap-2"
          >
            {action.icon ?? <Plus className="w-4 h-4" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
