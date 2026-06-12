"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import type { Employee, Role, Department, Shift } from "@/types";

interface EmployeeImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
  shifts: Shift[];
  onImport: (employees: Omit<Employee, "id">[]) => void;
}

const getTemplateCSV = (departments: Department[], shifts: Shift[]) => {
  const deptNames = departments.map(d => d.name).join(", ");
  const shiftNames = shifts.map(s => s.name).join(", ");
  return `NIK,Nama,Departemen,Shift,Role,Telepon,Email,Tanggal Masuk
3201234567890001,Ahmad Fauzi,${departments[0]?.name ?? "Web Developer"},${shifts[0]?.name ?? "Shift Pagi"},employee,081234567890,ahmad@alhamra.com,2023-01-15
3201234567890002,Budi Santoso,${departments[0]?.name ?? "Web Developer"},${shifts[0]?.name ?? "Shift Pagi"},employee,081234567891,budi@alhamra.com,2023-03-10

# Departemen valid: ${deptNames}
# Shift valid: ${shiftNames}
# Role valid: employee, admin, kiosk_security`;
};

export function EmployeeImport({ open, onOpenChange, departments, shifts, onImport }: EmployeeImportProps) {
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [preview, setPreview] = useState<Omit<Employee, "id">[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const downloadTemplate = () => {
    const template = getTemplateCSV(departments, shifts);
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_import_karyawan.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template berhasil diunduh");
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter(l => l.trim());
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const rows = lines.slice(1);
    const parsed: Omit<Employee, "id">[] = [];
    const errs: string[] = [];

    const deptMap = new Map(departments.map(d => [d.name.toLowerCase(), d.id]));
    const shiftMap = new Map(shifts.map(s => [s.name.toLowerCase(), s.id]));

    rows.forEach((line, idx) => {
      const cols = line.split(",").map(c => c.trim());
      const nik = cols[0];
      const name = cols[1];
      const deptName = cols[2]?.toLowerCase();
      const shiftName = cols[3]?.toLowerCase();
      const role = cols[4] as Role;
      const phone = cols[5];
      const email = cols[6];
      const joinedAt = cols[7];

      const deptId = deptMap.get(deptName);
      const shiftId = shiftMap.get(shiftName);

      if (!nik || !name) {
        errs.push(`Baris ${idx + 2}: NIK dan Nama wajib diisi`);
        return;
      }
      if (!deptId) {
        errs.push(`Baris ${idx + 2}: Departemen "${cols[2]}" tidak valid`);
      }
      if (!shiftId) {
        errs.push(`Baris ${idx + 2}: Shift "${cols[3]}" tidak valid`);
      }

      parsed.push({
        nik,
        name,
        department_id: deptId ?? "dept-1",
        department_name: departments.find(d => d.id === (deptId ?? "dept-1"))?.name ?? "Web Developer",
        default_shift_id: shiftId ?? "shift-1",
        shift_name: shifts.find(s => s.id === (shiftId ?? "shift-1"))?.name ?? "Shift Pagi",
        role: ["employee", "admin", "kiosk_security"].includes(role) ? role : "employee",
        phone: phone || "",
        email: email || "",
        joined_at: joinedAt || "2026-01-01",
        is_active: true,
      });
    });

    setPreview(parsed);
    setErrors(errs);
    setStep("preview");
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      toast.error("Hanya file CSV atau Excel yang didukung");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleConfirm = () => {
    if (preview.length === 0) {
      toast.error("Tidak ada data valid untuk diimport");
      return;
    }
    onImport(preview);
    setStep("upload");
    setPreview([]);
    setErrors([]);
    onOpenChange(false);
  };

  const reset = () => {
    setStep("upload");
    setPreview([]);
    setErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Karyawan dari CSV</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-sm">Langkah Import:</h3>
              <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                <li>Download template CSV di bawah</li>
                <li>Isi data karyawan (1 baris = 1 karyawan)</li>
                <li>Upload file yang sudah diisi</li>
                <li>Preview dan konfirmasi</li>
              </ol>
              <div className="text-[10px] text-slate-500 space-y-0.5">
                <p><strong>Departemen valid:</strong> {departments.map(d => d.name).join(", ")}</p>
                <p><strong>Shift valid:</strong> {shifts.map(s => s.name).join(", ")}</p>
                <p><strong>Role valid:</strong> employee, admin, kiosk_security</p>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template CSV
            </Button>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? "border-[#164e7f] bg-[#164e7f]/5" : "border-slate-300"}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Drag & drop file CSV di sini</p>
              <p className="text-xs text-slate-400">atau</p>
              <label className="cursor-pointer inline-block mt-2">
                <input type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <span className="text-sm text-[#164e7f] hover:underline">Pilih file</span>
              </label>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  {errors.length} error ditemukan
                </div>
                {errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-500">{e}</p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{preview.length} karyawan valid</p>
              <Button variant="ghost" size="sm" onClick={reset}>
                <X className="w-3 h-3 mr-1" /> Upload Ulang
              </Button>
            </div>

            <div className="overflow-x-auto max-h-60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIK</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Dept.</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((emp, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{emp.nik}</TableCell>
                      <TableCell className="font-medium text-sm">{emp.name}</TableCell>
                      <TableCell><Badge variant="outline">{emp.department_name}</Badge></TableCell>
                      <TableCell><Badge className="bg-[#039934] text-white text-xs">{emp.shift_name}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className="text-xs capitalize">{emp.role}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={reset}>Batal</Button>
              <Button className="bg-[#164e7f]" onClick={handleConfirm} disabled={preview.length === 0}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Import {preview.length} Karyawan
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
