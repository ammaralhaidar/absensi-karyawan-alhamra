"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, AlertTriangle, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatItem } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  clock: Clock,
  alert: AlertTriangle,
  layers: Layers,
};

const colorMap = {
  primary: "border-[#164e7f]/30 bg-[#164e7f]/5 text-[#164e7f]",
  success: "border-green-300 bg-green-50 text-green-700",
  warning: "border-amber-300 bg-amber-50 text-amber-700",
  danger: "border-red-300 bg-red-50 text-red-700",
  info: "border-blue-300 bg-blue-50 text-blue-700",
};

interface AdminStatsProps {
  stats: StatItem[];
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon] ?? Layers;
        return (
          <Card
            key={stat.label}
            className={cn("border-2 shadow-none", colorMap[stat.color])}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg shrink-0", colorMap[stat.color].split(" ").slice(1).join(" "))}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums leading-none">{stat.value}</p>
                <p className="text-xs mt-0.5 opacity-70">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
