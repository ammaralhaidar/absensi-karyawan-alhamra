import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface MobileCardProps {
  title: string;
  subtitle?: string;
  badges?: React.ReactNode[];
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MobileCard({
  title,
  subtitle,
  badges,
  meta,
  actions,
  onClick,
  className,
}: MobileCardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={cn(
        "w-full text-left bg-card rounded-xl border p-4 transition-all duration-150",
        onClick && "hover:shadow-md hover:border-primary/30 active:scale-[0.98] cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground text-sm truncate">{title}</h4>
          </div>

          {subtitle && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{subtitle}</p>
          )}

          {badges && badges.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {badges}
            </div>
          )}

          {meta && (
            <div className="text-xs text-muted-foreground/80">{meta}</div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {actions}
          {onClick && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </Component>
  );
}
