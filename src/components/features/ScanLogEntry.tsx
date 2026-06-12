import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScanRecord } from "@/types";

interface ScanLogEntryProps {
  scan: ScanRecord;
  highlight?: boolean;
  className?: string;
}

const statusMeta: Record<ScanRecord["status"], { color: string; bg: string; icon: React.ReactNode }> = {
  tepat_waktu: {
    color: "bg-green-500",
    bg: "bg-green-500/10",
    icon: <Check className="w-3 h-3" />,
  },
  terlambat: {
    color: "bg-yellow-500",
    bg: "bg-yellow-500/10",
    icon: <Clock className="w-3 h-3" />,
  },
  expired: {
    color: "bg-red-500",
    bg: "bg-red-500/10",
    icon: <XCircle className="w-3 h-3" />,
  },
  error: { color: "bg-red-600", bg: "bg-red-600/10", icon: <AlertTriangle className="w-3 h-3" /> },
};

export function ScanLogEntry({ scan, highlight = false, className }: ScanLogEntryProps) {
  const meta = statusMeta[scan.status];
  const time = scan.scanned_at.split("T")[1]?.slice(0, 5) ?? "--:--";

  return (
    <Card
      className={cn(
        "border-gray-200 bg-white transition-all duration-300",
        highlight && "ring-2 ring-secondary/50 scale-[1.02]",
        className
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <div className={cn("w-3 h-3 rounded-full shrink-0", meta.color)} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-medium text-sm truncate">{scan.employee_name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400 tabular-nums flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {time}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] border-gray-200 text-gray-500 px-1.5 py-0",
                  meta.bg
                )}
              >
                {scan.type === "check_in" ? "Masuk" : "Pulang"}
              </Badge>
            </div>
          </div>

          {/* Status Icon */}
          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", meta.bg)}>
            {meta.icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
