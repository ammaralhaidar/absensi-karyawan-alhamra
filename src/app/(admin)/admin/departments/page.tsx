"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Users, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useDepartments, useEmployees } from "@/hooks/useData";
import { DepartmentForm } from "@/components/features/DepartmentForm";
import type { Department } from "@/types";

export default function DepartmentsPage() {
  const { data: departmentsData, loading: departmentsLoading } = useDepartments();
  const { data: employeesData } = useEmployees();
  const [depts, setDepts] = useState<Department[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | undefined>(undefined);

  useEffect(() => {
    if (departmentsData.length > 0) {
      setDepts(departmentsData);
    }
  }, [departmentsData]);

  const getEmployeeCount = (deptId: string) => employeesData.filter(e => e.department_id === deptId).length;

  const handleAdd = () => {
    setEditingDept(undefined);
    setFormOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormOpen(true);
  };

  const handleSave = (data: Omit<Department, "id"> & { id?: string }) => {
    if (data.id) {
      setDepts(prev => prev.map(d => d.id === data.id ? { ...d, ...data } : d));
      toast.success("Departemen berhasil diupdate");
    } else {
      setDepts(prev => [...prev, { ...data, id: `dept-${Date.now()}` }]);
      toast.success("Departemen berhasil ditambahkan");
    }
    setFormOpen(false);
  };

  const handleDelete = (dept: Department) => {
    const count = getEmployeeCount(dept.id);
    if (count > 0) {
      toast.error(`Tidak dapat menghapus: ${count} karyawan terdaftar di ${dept.name}`);
      return;
    }
    setDepts(prev => prev.filter(d => d.id !== dept.id));
    toast.success("Departemen berhasil dihapus");
  };

  if (departmentsLoading) {
    return (
      <div className="space-y-6 animate-page-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#164e7f]">Manajemen Departemen</h1>
            <p className="text-sm text-slate-500">Kelola departemen dan divisi perusahaan</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#164e7f]">Manajemen Departemen</h1>
          <p className="text-sm text-slate-500">Kelola departemen dan divisi perusahaan</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#164e7f] hover:bg-[#164e7f]/90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Departemen
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {depts.map((dept, i) => {
          const count = getEmployeeCount(dept.id);
          return (
            <Card
              key={dept.id}
              className="animate-card-in hover:shadow-md transition-shadow"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-[#164e7f]/10 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-[#164e7f]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(dept)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDelete(dept)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="font-bold text-slate-800">{dept.name}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dept.description}</p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <Badge variant="outline" className="text-xs font-normal">
                    {count} karyawan
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {depts.length === 0 && (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Belum ada departemen</p>
          <Button onClick={handleAdd} variant="outline" className="mt-3">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Departemen
          </Button>
        </div>
      )}

      <DepartmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        department={editingDept}
        onSave={handleSave}
      />
    </div>
  );
}
