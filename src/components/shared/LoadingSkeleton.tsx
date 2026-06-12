import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  variant: "card" | "table" | "form" | "page";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  variant,
  count = 1,
  className,
}: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 space-y-3 animate-pulse"
          >
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("rounded-xl border overflow-hidden animate-pulse", className)}>
        <div className="bg-muted/50 p-3 border-b">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="divide-y">
          {Array.from({ length: Math.max(1, count) }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3"
            >
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className={cn("space-y-5 animate-pulse", className)}>
        {Array.from({ length: Math.max(2, count) }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // Page variant
  return (
    <div className={cn("space-y-6 animate-pulse", className)}>
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
