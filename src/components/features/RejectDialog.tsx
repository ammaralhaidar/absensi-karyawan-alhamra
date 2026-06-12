"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  onReject: (reason: string) => void;
}

export function RejectDialog({ open, onOpenChange, employeeName, onReject }: RejectDialogProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReject(reason || "Tanpa alasan");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tolak Pengajuan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-3">
              Tolak pengajuan <span className="font-semibold">{employeeName}</span>?
            </p>
            <Label className="text-xs">Alasan penolakan</Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Tulis alasan penolakan..."
              className="mt-1 text-sm"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" variant="destructive">Tolak</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
