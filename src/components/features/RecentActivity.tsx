"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScanLine, CheckCircle, FileText, UserPen, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { AdminActivity } from "@/types";

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  scan: ScanLine,
  approval: CheckCircle,
  leave_request: FileText,
  employee_update: UserPen,
};

const typeLabel: Record<string, string> = {
  scan: "Scan",
  approval: "Approval",
  leave_request: "Pengajuan",
  employee_update: "Update",
};

const typeColor: Record<string, string> = {
  scan: "bg-blue-500",
  approval: "bg-green-500",
  leave_request: "bg-amber-500",
  employee_update: "bg-purple-500",
};

interface RecentActivityProps {
  activities: AdminActivity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);

    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHrs < 24) return `${diffHrs} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold text-[#164e7f]">
          Aktivitas Terbaru
        </CardTitle>
        <Link href="/admin/activity-log">
          <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-[#164e7f]">
            Lihat semua
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-0">
        {activities.slice(0, 5).map((activity, i) => {
          const Icon = typeIcon[activity.type] ?? FileText;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0 animate-card-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`p-1.5 rounded-full ${typeColor[activity.type]} text-white shrink-0 mt-0.5`}>
                <Icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 truncate">{activity.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{activity.user_name}</span>
                  <span className="text-[10px] text-slate-300">•</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-auto border-slate-200 text-slate-500">
                    {typeLabel[activity.type]}
                  </Badge>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 pt-0.5 tabular-nums">
                {formatTime(activity.timestamp)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
