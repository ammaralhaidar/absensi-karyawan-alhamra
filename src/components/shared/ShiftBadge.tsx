import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface ShiftBadgeProps {
  shift: string;
  timeRange?: string;
  size?: "sm" | "md";
  className?: string;
}

const shiftColors: Record<string, string> = {
  "Shift Pagi": "bg-green-100 text-green-700 border-green-300",
  "Shift Siang": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Shift Malam": "bg-blue-100 text-blue-700 border-blue-300",
};

const defaultColor = "bg-slate-100 text-slate-700 border-slate-300";

export function ShiftBadge({
  shift,
  timeRange,
  size = "sm",
  className,
}: ShiftBadgeProps) {
  const color = shiftColors[shift] ?? defaultColor;
  const isSm = size === "sm";

  return (
    <Badge
      variant="outline"
      className={cn(
        color,
        "font-medium gap-1",
        isSm ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5",
        className
      )}
    >
      <Clock className={isSm ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {shift}
      {timeRange && (
        <span className="opacity-70 ml-0.5">{timeRange}</span>
      )}
    </Badge>
  );
}
