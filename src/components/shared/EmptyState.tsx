import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "compact";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-8 px-4 text-center",
          className
        )}
      >
        <div className="text-muted-foreground/60 mb-2">
          {icon ?? <FileX className="w-8 h-8" />}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>
        )}
        {action && (
          <Button variant="outline" size="sm" className="mt-3" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <div className="text-muted-foreground/50">
          {icon ?? <FileX className="w-10 h-10" />}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && (
        <Button className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
