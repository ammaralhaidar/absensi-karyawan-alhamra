"use client";

import { CalendarDays, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Separator } from "@/components/ui/separator";
import type { LeaveRequest } from "@/types";

interface LeaveDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: LeaveRequest | null;
}

const typeLabels: Record<string, string> = {
  cuti_tahunan: "Cuti Tahunan",
  sakit: "Sakit",
  izin: "Izin",
};

export function LeaveDetail({ open, onOpenChange, request }: LeaveDetailProps) {
  if (!request) return null;

  const dateRange =
    request.start_date === request.end_date
      ? request.start_date
      : `${request.start_date} - ${request.end_date}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">Detail Pengajuan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Employee */}
          <AvatarWithName
            name={request.employee_name}
            subtitle={typeLabels[request.leave_type]}
            size="md"
          />

          <Separator />

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={request.status} size="sm" />
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{dateRange}</span>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <p className="text-sm font-medium">Alasan</p>
            <p className="text-sm text-muted-foreground">{request.reason}</p>
          </div>

          {/* Attachment */}
          {request.attachment_url && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Lampiran</p>
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">Surat Dokter</span>
              </div>
            </div>
          )}

          {/* Created */}
          <p className="text-xs text-muted-foreground">
            Diajukan: {request.created_at}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
