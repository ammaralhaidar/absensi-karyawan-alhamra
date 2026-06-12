import { Badge } from "@/components/ui/badge";
import { ShiftBadge } from "@/components/shared/ShiftBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Employee, RosterEntry } from "@/types";

interface RosterGridProps {
  employees: Employee[];
  entries: RosterEntry[];
  month: number;
  year: number;
  onCellClick?: (employeeId: string, date: string) => void;
  className?: string;
}

const daysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

export function RosterGrid({
  employees,
  entries,
  month,
  year,
  onCellClick,
  className,
}: RosterGridProps) {
  const totalDays = daysInMonth(year, month);

  const getShift = (employeeId: string, date: string) => {
    const entry = entries.find(
      (e) => e.employee_id === employeeId && e.date === date
    );
    return entry?.shift_name ?? null;
  };

  return (
    <div className={cn("rounded-xl border overflow-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="sticky left-0 bg-muted/30 min-w-[160px] text-xs font-semibold">
              Karyawan
            </TableHead>
            <TableHead className="text-xs font-semibold text-center">
              Departemen
            </TableHead>
            {Array.from({ length: totalDays }).map((_, i) => (
              <TableHead
                key={i}
                className="text-center text-xs font-semibold min-w-[44px]"
              >
                {i + 1}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="border-b last:border-0">
              <TableCell className="sticky left-0 bg-card font-medium text-sm">
                {employee.name}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">
                  {employee.department_name}
                </Badge>
              </TableCell>
              {Array.from({ length: totalDays }).map((_, i) => {
                const date = `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                const shift = getShift(employee.id, date);

                return (
                  <TableCell
                    key={i}
                    className={cn(
                      "text-center p-1",
                      onCellClick && "cursor-pointer hover:bg-muted/30 transition-colors"
                    )}
                    onClick={() => onCellClick?.(employee.id, date)}
                  >
                    {shift ? (
                      <ShiftBadge shift={shift} size="sm" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground/40">-</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
