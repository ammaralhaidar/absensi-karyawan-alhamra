"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import type { DepartmentStat } from "@/types";

interface DepartmentOverviewProps {
  stats: DepartmentStat[];
}

export function DepartmentOverview({ stats }: DepartmentOverviewProps) {
  const totalKaryawan = stats.reduce((sum, s) => sum + s.total_karyawan, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold text-[#164e7f] flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Kehadiran per Departemen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((dept) => {
          const pct = totalKaryawan > 0 ? (dept.hadir / dept.total_karyawan) * 100 : 0;
          return (
            <div key={dept.department_id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{dept.department_name}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-auto">{dept.total_karyawan} org</Badge>
                </div>
                <span className="text-sm font-bold tabular-nums text-[#164e7f]">
                  {dept.hadir}/{dept.total_karyawan}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#039934] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                {dept.sakit > 0 && <span>Sakit: {dept.sakit}</span>}
                {dept.izin > 0 && <span>Izin: {dept.izin}</span>}
                {dept.cuti > 0 && <span>Cuti: {dept.cuti}</span>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
