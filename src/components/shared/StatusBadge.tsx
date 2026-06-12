import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle, XCircle, AlertTriangle, Camera } from "lucide-react";

type StatusBadgeVariant = "default" | "outline" | "dot";

interface StatusBadgeProps {
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "tepat_waktu"
    | "terlambat"
    | "lupa_checkout"
    | "sistem_auto_close"
    | "expired"
    | "error";
  size?: "sm" | "md" | "lg";
  variant?: StatusBadgeVariant;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "bg-amber-500 text-white border-amber-500",
    icon: <Clock className="w-3 h-3" />,
  },
  approved: {
    label: "Disetujui",
    color: "bg-green-500 text-white border-green-500",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  rejected: {
    label: "Ditolak",
    color: "bg-red-500 text-white border-red-500",
    icon: <XCircle className="w-3 h-3" />,
  },
  tepat_waktu: {
    label: "Tepat Waktu",
    color: "bg-green-500 text-white border-green-500",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  terlambat: {
    label: "Terlambat",
    color: "bg-yellow-500 text-white border-yellow-500",
    icon: <Clock className="w-3 h-3" />,
  },
  lupa_checkout: {
    label: "Lupa Checkout",
    color: "bg-red-500 text-white border-red-500",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  sistem_auto_close: {
    label: "Auto Close",
    color: "bg-slate-500 text-white border-slate-500",
    icon: <Clock className="w-3 h-3" />,
  },
  expired: {
    label: "Expired",
    color: "bg-red-500 text-white border-red-500",
    icon: <XCircle className="w-3 h-3" />,
  },
  error: {
    label: "Error",
    color: "bg-red-600 text-white border-red-600",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const sizeClasses: Record<string, string> = {
  sm: "text-[10px] px-1.5 py-0 gap-1",
  md: "text-xs px-2 py-0.5 gap-1",
  lg: "text-sm px-2.5 py-1 gap-1.5",
};

const dotColors: Record<string, string> = {
  pending: "bg-amber-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  tepat_waktu: "bg-green-500",
  terlambat: "bg-yellow-500",
  lupa_checkout: "bg-red-500",
  sistem_auto_close: "bg-slate-500",
  expired: "bg-red-500",
  error: "bg-red-600",
};

export function StatusBadge({
  status,
  size = "md",
  variant = "default",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    color: "bg-slate-500 text-white",
    icon: null,
  };

  if (variant === "dot") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <div className={cn("w-2 h-2 rounded-full shrink-0", dotColors[status])} />
        <span className={cn("text-xs font-medium text-muted-foreground", size === "lg" && "text-sm")}>
          {config.label}
        </span>
      </div>
    );
  }

  if (variant === "outline") {
    return (
      <Badge
        variant="outline"
        className={cn(
          sizeClasses[size],
          "border-current font-medium",
          className
        )}
      >
        {config.icon}
        {config.label}
      </Badge>
    );
  }

  return (
    <Badge className={cn(sizeClasses[size], config.color, "font-medium", className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
