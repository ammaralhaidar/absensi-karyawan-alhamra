"use client";

import { User, Building2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DepartmentBadge } from "@/components/shared/DepartmentBadge";
import { ShiftBadge } from "@/components/shared/ShiftBadge";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import type { Employee } from "@/types";

interface EmployeeInfoCardProps {
  employee: Employee;
  showShift?: boolean;
  compact?: boolean;
  className?: string;
}

export function EmployeeInfoCard({
  employee,
  showShift = true,
  compact = false,
  className,
}: EmployeeInfoCardProps) {
  if (compact) {
    return (
      <div className={className}>
        <AvatarWithName
          name={employee.name}
          subtitle={employee.department_name}
          size="sm"
        />
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <AvatarWithName
          name={employee.name}
          subtitle={employee.department_name}
          size="md"
        />
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <DepartmentBadge department={employee.department_name} />
          {showShift && <ShiftBadge shift={employee.shift_name} />}
          {employee.is_active && (
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Aktif
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
