import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";

interface DepartmentBadgeProps {
  department: string;
  size?: "sm" | "md";
  className?: string;
}

const deptColors: Record<string, string> = {
  "Web Developer": "bg-blue-100 text-blue-700 border-blue-300",
  Dapur: "bg-orange-100 text-orange-700 border-orange-300",
  Security: "bg-red-100 text-red-700 border-red-300",
  HR: "bg-purple-100 text-purple-700 border-purple-300",
};

const defaultColor = "bg-slate-100 text-slate-700 border-slate-300";

export function DepartmentBadge({
  department,
  size = "sm",
  className,
}: DepartmentBadgeProps) {
  const color = deptColors[department] ?? defaultColor;
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
      <Building2 className={isSm ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {department}
    </Badge>
  );
}
