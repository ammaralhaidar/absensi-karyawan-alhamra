import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { CalendarDays, FileText, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaveRequest } from "@/types";

interface LeaveRequestCardProps {
  request: LeaveRequest;
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

const typeLabels: Record<string, string> = {
  cuti_tahunan: "Cuti Tahunan",
  sakit: "Sakit",
  izin: "Izin",
};

export function LeaveRequestCard({
  request,
  showActions = false,
  onApprove,
  onReject,
  onClick,
  compact = false,
  className,
}: LeaveRequestCardProps) {
  const dateRange =
    request.start_date === request.end_date
      ? request.start_date
      : `${request.start_date} - ${request.end_date}`;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between py-3 border-b last:border-0",
          onClick && "cursor-pointer hover:bg-muted/30 px-3 -mx-3 rounded-lg transition-colors",
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-3 min-w-0">
          <AvatarWithName name={request.employee_name} size="sm" />
          <div className="min-w-0">
            <span className="text-xs text-muted-foreground">{dateRange}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={request.status} size="sm" />
          {showActions && request.status === "pending" && (
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                className="h-7 w-7 bg-green-500 hover:bg-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove?.();
                }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject?.();
                }}
              >
                <XCircle className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 transition-all duration-150",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/30 active:scale-[0.99]",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <AvatarWithName
          name={request.employee_name}
          subtitle={typeLabels[request.leave_type]}
          size="md"
        />
        <StatusBadge status={request.status} size="sm" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4" />
          <span>{dateRange}</span>
        </div>

        <p className="text-sm text-foreground/80 line-clamp-2">{request.reason}</p>

        {request.attachment_url && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Ada lampiran</span>
          </div>
        )}
      </div>

      {showActions && request.status === "pending" && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Button
            size="sm"
            className="flex-1 bg-green-500 hover:bg-green-600"
            onClick={(e) => {
              e.stopPropagation();
              onApprove?.();
            }}
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onReject?.();
            }}
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
