"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, FileText, Paperclip, Clock, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import type { LeaveRequest, LeaveStatus } from "@/types";

const statusConfig: Record<LeaveStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-500" },
  approved: { label: "Disetujui", color: "bg-green-500" },
  rejected: { label: "Ditolak", color: "bg-red-500" },
};

const typeLabels: Record<string, string> = {
  cuti_tahunan: "Cuti Tahunan",
  sakit: "Sakit",
  izin: "Izin",
};

interface ApprovalDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: LeaveRequest;
  onApprove?: (req: LeaveRequest) => void;
  onReject?: (req: LeaveRequest) => void;
}

export function ApprovalDetail({ open, onOpenChange, request, onApprove, onReject }: ApprovalDetailProps) {
  const isSingleDay = request.start_date === request.end_date;
  const status = statusConfig[request.status];
  const isPending = request.status === "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Pengajuan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800">{request.employee_name}</p>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2.5">
            <Row icon={FileText} label="Tipe" value={typeLabels[request.leave_type] ?? request.leave_type} />
            <Row icon={Calendar} label="Tanggal" value={isSingleDay ? request.start_date : `${request.start_date} - ${request.end_date}`} />
            <Row icon={Clock} label="Diajukan" value={request.created_at} />
            <Row
              icon={Paperclip}
              label="Lampiran"
              value={request.attachment_url ? (
                <a
                  href={request.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#164e7f] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Lihat Lampiran
                </a>
              ) : "Tidak ada"}
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-medium text-slate-500 mb-1">Alasan</p>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{request.reason}</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {isPending && onApprove && (
            <Button className="bg-green-500 hover:bg-green-600" onClick={() => { onApprove(request); onOpenChange(false); }}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          )}
          {isPending && onReject && (
            <Button variant="destructive" onClick={() => { onReject(request); onOpenChange(false); }}>
              <XCircle className="w-4 h-4 mr-2" />
              Tolak
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
      <span className="text-xs text-slate-500 w-20 shrink-0">{label}</span>
      <span className="text-sm text-slate-700 font-medium">{value}</span>
    </div>
  );
}
