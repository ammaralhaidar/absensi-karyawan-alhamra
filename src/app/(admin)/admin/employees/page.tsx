"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Pencil, Trash2, ArrowUpDown, Upload } from "lucide-react";
import { toast } from "sonner";
import { useEmployees, useDepartments, useShifts } from "@/hooks/useData";
import { EmployeeForm } from "@/components/features/EmployeeForm";
import { EmployeeDetail } from "@/components/features/EmployeeDetail";
import { EmployeeImport } from "@/components/features/EmployeeImport";
import { createEmployee, updateEmployee, deleteEmployee } from "@/lib/data/employees";
import type { Employee, Role } from "@/types";

type SortField = "name" | "department_name" | "joined_at";
type SortDir = "asc" | "desc";

export default function EmployeesPage() {
  const { data: employeesData, loading: employeesLoading } = useEmployees();
  const { data: departmentsData, loading: departmentsLoading } = useDepartments();
  const { data: shiftsData, loading: shiftsLoading } = useShifts();
  
  const [emps, setEmps] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    if (employeesData.length > 0) {
      setEmps(employeesData);
    }
  }, [employeesData]);

  const filtered = useMemo(() => {
    let list = [...emps];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.nik.toLowerCase().includes(q) || e.department_name.toLowerCase().includes(q));
    }
    if (filterDept !== "all") list = list.filter(e => e.department_id === filterDept);
    if (filterStatus === "active") list = list.filter(e => e.is_active);
    if (filterStatus === "inactive") list = list.filter(e => !e.is_active);
    list.sort((a, b) => {
      let va = String(a[sortField] ?? "");
      let vb = String(b[sortField] ?? "");
      if (sortField === "joined_at") { va = a.joined_at; vb = b.joined_at; }
      const cmp = va.localeCompare(vb);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [emps, search, filterDept, filterStatus, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const handleAdd = () => {
    setEditingEmployee(undefined);
    setFormOpen(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormOpen(true);
  };

  const handleSave = async (data: Omit<Employee, "id"> & { id?: string }) => {
    try {
      if (data.id) {
        await updateEmployee(data.id, data);
        setEmps(prev => prev.map(e => e.id === data.id ? { ...e, ...data } : e));
        toast.success("Karyawan berhasil diupdate");
      } else {
        const newEmp = await createEmployee(data);
        setEmps(prev => [newEmp, ...prev]);
        toast.success("Karyawan berhasil ditambahkan (user login otomatis dibuat)");
      }
      setFormOpen(false);
    } catch (error: any) {
      toast.error("Gagal menyimpan: " + error.message);
    }
  };

  const handleDelete = async (emp: Employee) => {
    try {
      await deleteEmployee(emp.id);
      setEmps(prev => prev.map(e => e.id === emp.id ? { ...e, is_active: !e.is_active } : e));
      toast.info(emp.is_active ? "Karyawan dinonaktifkan" : "Karyawan diaktifkan kembali");
    } catch (error: any) {
      toast.error("Gagal mengubah status: " + error.message);
    }
  };

  const handleView = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDetailOpen(true);
  };

  const handleImport = async (data: Omit<Employee, "id">[]) => {
    try {
      const { createEmployeesBulk } = await import("@/lib/data/employees");
      const { created, errors } = await createEmployeesBulk(data);
      if (created.length > 0) {
        setEmps(prev => [...created, ...prev]);
        toast.success(`${created.length} karyawan berhasil diimport (user login otomatis dibuat)`);
      }
      if (errors.length > 0) {
        toast.error(`${errors.length} gagal: ${errors[0]}`);
      }
    } catch (error: any) {
      toast.error("Gagal import: " + error.message);
    }
  };

  const roleLabel: Record<Role, string> = { employee: "Karyawan", admin: "Admin", kiosk_security: "Kiosk" };

  const loading = employeesLoading || departmentsLoading || shiftsLoading;

  if (loading) {
    return (
      <div className="space-y-6 animate-page-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#164e7f]">Manajemen Karyawan</h1>
            <p className="text-sm text-slate-500">Kelola data karyawan dan status keaktifan</p>
          </div>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#164e7f]">Manajemen Karyawan</h1>
          <p className="text-sm text-slate-500">Kelola data karyawan dan status keaktifan</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleAdd} className="bg-[#164e7f] hover:bg-[#164e7f]/90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Karyawan
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="Cari nama, NIK, atau departemen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm bg-white"
          />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="Departemen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Dept.</SelectItem>
            {departmentsData.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="h-9 px-3 text-sm font-normal">
          {filtered.length} karyawan
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="cursor-pointer hover:text-[#164e7f]" onClick={() => toggleSort("name")}>
                    <div className="flex items-center gap-1">Nama <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead className="cursor-pointer hover:text-[#164e7f]" onClick={() => toggleSort("department_name")}>
                    <div className="flex items-center gap-1">Dept. <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-36">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((emp, i) => (
                  <TableRow key={emp.id} className="animate-card-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <TableCell className="text-xs text-slate-400">{i + 1}</TableCell>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">{emp.nik.slice(-6)}</TableCell>
                    <TableCell><Badge variant="outline">{emp.department_name}</Badge></TableCell>
                    <TableCell><Badge className="bg-[#039934] text-white text-xs">{emp.shift_name}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{roleLabel[emp.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={emp.is_active ? "bg-green-500" : "bg-red-500"}>{emp.is_active ? "Aktif" : "Nonaktif"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(emp)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(emp)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDelete(emp)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                      <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Tidak ada karyawan ditemukan</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EmployeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editingEmployee}
        departments={departmentsData}
        shifts={shiftsData}
        onSave={handleSave}
      />

      <EmployeeImport
        open={importOpen}
        onOpenChange={setImportOpen}
        departments={departmentsData}
        shifts={shiftsData}
        onImport={handleImport}
      />

      {selectedEmployee && (
        <EmployeeDetail
          open={detailOpen}
          onOpenChange={setDetailOpen}
          employee={selectedEmployee}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
