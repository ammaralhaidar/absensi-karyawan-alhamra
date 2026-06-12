import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "./EmptyState";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { cn } from "@/lib/utils";

interface ColumnDef<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyState?: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  emptyState,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("rounded-xl border overflow-hidden", className)}>
        <div className="bg-muted/30 px-4 py-3 border-b">
          <div className="flex gap-4">
            {columns.map((col) => (
              <div key={col.key} className="h-3 bg-muted rounded w-20 animate-pulse" />
            ))}
          </div>
        </div>
        <LoadingSkeleton variant="table" count={5} />
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className={cn("rounded-xl border bg-card", className)}>
        <EmptyState
          variant="compact"
          icon={emptyState.icon}
          title={emptyState.title}
          description={emptyState.description}
          action={emptyState.action}
        />
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider", col.className)}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.id}
              className={cn(
                "border-b last:border-0 transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/50"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
