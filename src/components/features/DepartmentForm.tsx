"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Department } from "@/types";

interface DepartmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department;
  onSave: (data: Omit<Department, "id"> & { id?: string }) => void;
}

export function DepartmentForm({ open, onOpenChange, department, onSave }: DepartmentFormProps) {
  const isEdit = !!department;
  const [name, setName] = useState(department?.name ?? "");
  const [description, setDescription] = useState(department?.description ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...(isEdit ? { id: department!.id } : {}), name, description });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Departemen" : "Tambah Departemen"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nama Departemen</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Deskripsi</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} className="text-sm" rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" className="bg-[#164e7f] hover:bg-[#164e7f]/90">{isEdit ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
