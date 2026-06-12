import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Clock, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceLog } from "@/types";

interface AttendanceStatusCardProps {
  log: AttendanceLog;
  compact?: boolean;
  className?: string;
}

export function AttendanceStatusCard({
  log,
  compact = false,
  className,
}: AttendanceStatusCardProps) {
  const formatTime = (isoString: string | null) => {
    if (!isoString) return "-";
    return isoString.split("T")[1]?.slice(0, 5) ?? "-";
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 text-sm", className)}>
        <div className={cn(
          "w-2 h-2 rounded-full shrink-0",
          log.check_in ? "bg-green-500" : "bg-slate-300"
        )} />
        <div className="flex-1">
          <span className="text-foreground font-medium">{log.employee_name}</span>
        </div>
        <span className="text-muted-foreground tabular-nums text-xs">
          {formatTime(log.check_in)}
        </span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-secondary flex items-center gap-2 text-base">
          <Clock className="w-5 h-5" />
          Status Absensi Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AttendanceRow
          label="Check-in"
          time={formatTime(log.check_in)}
          status={log.status_in}
          hasData={!!log.check_in}
          colors={{ bg: "bg-green-50", border: "border-green-200", text: "text-green-700" }}
        />
        <AttendanceRow
          label="Check-out"
          time={formatTime(log.check_out)}
          status={log.anomaly_flag ? "lupa_checkout" : undefined}
          hasData={!!log.check_out}
          colors={{ bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" }}
        />
      </CardContent>
    </Card>
  );
}

interface AttendanceRowProps {
  label: string;
  time: string;
  status?: string | null;
  hasData: boolean;
  colors: { bg: string; border: string; text: string };
}

function AttendanceRow({ label, time, status, hasData, colors }: AttendanceRowProps) {
  return (
    <div className={cn("flex items-center justify-between p-3 rounded-lg border", colors.bg, colors.border)}>
      <div className="flex items-center gap-2">
        {label === "Check-in" ? (
          <LogIn className="w-4 h-4 text-muted-foreground" />
        ) : (
          <LogOut className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("font-bold text-sm tabular-nums", hasData ? colors.text : "text-muted-foreground")}>
          {time}
        </span>
        {status && <StatusBadge status={status as any} size="sm" />}
      </div>
    </div>
  );
}
