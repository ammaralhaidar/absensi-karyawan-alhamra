import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarWithNameProps {
  name: string;
  subtitle?: string;
  subtitleAlt?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  showAvatar?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { avatar: "h-7 w-7", name: "text-xs", subtitle: "text-[10px]" },
  md: { avatar: "h-9 w-9", name: "text-sm", subtitle: "text-xs" },
  lg: { avatar: "h-12 w-12", name: "text-base", subtitle: "text-sm" },
};

export function AvatarWithName({
  name,
  subtitle,
  subtitleAlt,
  avatarUrl,
  size = "md",
  showAvatar = true,
  className,
}: AvatarWithNameProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showAvatar && (
        <Avatar className={sizeClasses[size].avatar}>
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="min-w-0">
        <p className={cn("font-medium text-foreground truncate", sizeClasses[size].name)}>
          {name}
        </p>
        {subtitle && (
          <p className={cn("text-muted-foreground truncate", sizeClasses[size].subtitle)}>
            {subtitle}
          </p>
        )}
        {subtitleAlt && (
          <p className={cn("text-muted-foreground/70 truncate", sizeClasses[size].subtitle)}>
            {subtitleAlt}
          </p>
        )}
      </div>
    </div>
  );
}
