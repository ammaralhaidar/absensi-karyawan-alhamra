"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Upload, X, FileText, Paperclip } from "lucide-react";

interface LeaveFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const leaveTypes = [
  { value: "cuti_tahunan", label: "Cuti Tahunan" },
  { value: "sakit", label: "Sakit" },
  { value: "izin", label: "Izin" },
];

export function LeaveForm({ onSuccess, onCancel }: LeaveFormProps) {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const isSickLeave = leaveType === "sakit";
  const isValid =
    leaveType &&
    startDate &&
    (endDate || startDate) &&
    reason.length >= 10 &&
    (isSickLeave ? !!file : true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error("File terlalu besar", { description: "Maksimal 5MB" });
        return;
      }
      setFile(selected);
    }
  };

  const handleAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File terlalu besar", { description: "Maksimal 5MB" });
      return;
    }

    setAttachmentFile(selected);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selected);
      const resp = await fetch("/api/upload-attachment", { method: "POST", body: formData });
      const data = await resp.json();
      if (data.url) {
        setAttachmentUrl(data.url);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      toast.error("Gagal upload: " + err.message);
      setAttachmentFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Pengajuan berhasil disimpan", {
        description: `Status: Pending - ${leaveTypes.find((t) => t.value === leaveType)?.label}${attachmentUrl ? " (dengan lampiran)" : ""}`,
      });
      onSuccess?.();
    }, 800);
  };

  return (
    <div className="space-y-5">
      {/* Tipe */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Tipe Pengajuan <span className="text-red-500">*</span>
        </Label>
        <Select value={leaveType} onValueChange={setLeaveType}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih tipe" />
          </SelectTrigger>
          <SelectContent>
            {leaveTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tanggal */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Rentang Tanggal <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Mulai</span>
            <div className="relative">
              <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Selesai</span>
            <div className="relative">
              <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alasan */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Alasan <span className="text-red-500">*</span>
        </Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Jelaskan alasan pengajuan (min. 10 karakter)..."
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">
          {reason.length}/10 karakter minimum
        </p>
      </div>

      {/* Lampiran (for sakit) */}
      {isSickLeave && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Lampiran (Surat Dokter) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 px-4 py-4 bg-muted/30 transition-colors hover:bg-muted/50">
              {file ? (
                <>
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Upload surat dokter</p>
                    <p className="text-xs text-muted-foreground/60">
                      Gambar atau PDF, max 5MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lampiran Umum */}
      <div className="space-y-1.5">
        <Label className="text-xs">Lampiran (Foto/Dokumen)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*,.pdf"
            onChange={handleAttachmentChange}
            disabled={uploading}
            className="h-9 text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-100 file:text-xs"
          />
          {uploading && <span className="text-xs text-slate-400">Uploading...</span>}
        </div>
        {attachmentFile && !uploading && (
          <div className="flex items-center gap-2 mt-1">
            <Paperclip className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600">{attachmentFile.name} — Terupload</span>
            <button onClick={() => { setAttachmentFile(null); setAttachmentUrl(""); }} className="text-red-400 hover:text-red-600">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Batal
        </Button>
        <Button
          className="flex-1"
          disabled={!isValid || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Menyimpan..." : "Kirim Pengajuan"}
        </Button>
      </div>
    </div>
  );
}
