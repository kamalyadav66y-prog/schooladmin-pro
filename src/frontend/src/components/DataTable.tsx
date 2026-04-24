import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyState?: ReactNode;
  keyExtractor: (row: T, index: number) => string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyState,
  keyExtractor,
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border overflow-hidden",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3",
                  col.headerClassName,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            ["sk0", "sk1", "sk2", "sk3", "sk4"].map((skKey) => (
              <TableRow key={skKey}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-12 text-muted-foreground"
              >
                {emptyState ?? "No records found"}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={keyExtractor(row, index)}
                className="table-row-hover"
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn("py-3", col.className)}
                  >
                    {col.cell(row, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
