import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText, Clock, AlertTriangle, UserX, CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MonthlyReport } from "@/types";

interface ReportSummaryCardsProps {
  reports: MonthlyReport[];
  className?: string;
}

interface SummaryItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  getTotal: (reports: MonthlyReport[]) => number;
}

const items: SummaryItem[] = [
  {
    key: "hadir",
    label: "Hadir",
    icon: <CheckCircle className="w-5 h-5" />,
    color: "text-green-600",
    getTotal: (r) => r.reduce((sum, e) => sum + e.total_hadir, 0),
  },
  {
    key: "sakit",
    label: "Sakit",
    icon: <FileText className="w-5 h-5" />,
    color: "text-blue-600",
    getTotal: (r) => r.reduce((sum, e) => sum + e.total_sakit, 0),
  },
  {
    key: "izin",
    label: "Izin",
    icon: <FileText className="w-5 h-5" />,
    color: "text-purple-600",
    getTotal: (r) => r.reduce((sum, e) => sum + e.total_izin, 0),
  },
  {
    key: "cuti",
    label: "Cuti",
    icon: <CalendarX className="w-5 h-5" />,
    color: "text-amber-600",
    getTotal: (r) => r.reduce((sum, e) => sum + e.total_cuti, 0),
  },
  {
    key: "alpa",
    label: "Alpa",
    icon: <UserX className="w-5 h-5" />,
    color: "text-red-600",
    getTotal: (r) => r.reduce((sum, e) => sum + e.total_alpa, 0),
  },
  {
    key: "terlambat",
    label: "Terlambat",
    icon: <Clock className="w-5 h-5" />,
    color: "text-yellow-600",
    getTotal: (r) => r.reduce((sum, e) => sum + e.total_terlambat, 0),
  },
];

export function ReportSummaryCards({ reports, className }: ReportSummaryCardsProps) {
  return (
    <div className={cn("grid grid-cols-3 lg:grid-cols-6 gap-3", className)}>
      {items.map((item) => {
        const total = item.getTotal(reports);
        return (
          <Card key={item.key} className="border-muted">
            <CardContent className="pt-4 text-center">
              <div className={cn("flex justify-center mb-2", item.color)}>{item.icon}</div>
              <p className={cn("text-xl font-bold tabular-nums", item.color)}>{total}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
