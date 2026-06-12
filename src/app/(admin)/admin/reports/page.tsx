"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Download, FileSpreadsheet, Search, ArrowUpDown, Printer, CheckCircle, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { useReports, useDepartments } from "@/hooks/useData";
import type { MonthlyReport } from "@/types";

const statusColors: Record<string, string> = {
  H: "bg-green-500 text-white", S: "bg-blue-500 text-white", I: "bg-purple-500 text-white",
  C: "bg-amber-500 text-white", A: "bg-red-500 text-white", T: "bg-yellow-500 text-white",
};

const statusLabels: Record<string, string> = {
  H: "Hadir", S: "Sakit", I: "Izin", C: "Cuti", A: "Alpa", T: "Terlambat",
};

type SortField = "employee_name" | "total_hadir" | "total_jam_kerja";

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function ReportsPage() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const { data: reportsData, loading: reportsLoading } = useReports(String(selectedMonth), String(selectedYear));
  const { data: departmentsData, loading: departmentsLoading } = useDepartments();
  
  const [filterDept, setFilterDept] = useState("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("employee_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [exporting, setExporting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<MonthlyReport | null>(null);

  const monthLabel = `${monthNames[selectedMonth - 1]} ${selectedYear}`;
  const maxDays = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayColumns = Array.from({ length: maxDays }, (_, i) => String(i + 1));

  const reports = useMemo(() => {
    let list = [...reportsData];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.employee_name.toLowerCase().includes(q) || r.department_name.toLowerCase().includes(q));
    }
    if (filterDept !== "all") {
      const dept = departmentsData.find(d => d.id === filterDept);
      if (dept) list = list.filter(r => r.department_name === dept.name);
    }
    list.sort((a, b) => {
      let va = String(a[sortField] ?? "");
      let vb = String(b[sortField] ?? "");
      if (sortField !== "employee_name") { va = String(a[sortField]).padStart(3, "0"); vb = String(b[sortField]).padStart(3, "0"); }
      const cmp = va.localeCompare(vb);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [reportsData, search, filterDept, departmentsData, sortField, sortDir]);

  const totals = useMemo(() => ({
    hadir: reports.reduce((s, r) => s + r.total_hadir, 0),
    sakit: reports.reduce((s, r) => s + r.total_sakit, 0),
    izin: reports.reduce((s, r) => s + r.total_izin, 0),
    cuti: reports.reduce((s, r) => s + r.total_cuti, 0),
    alpa: reports.reduce((s, r) => s + r.total_alpa, 0),
    terlambat: reports.reduce((s, r) => s + r.total_terlambat, 0),
  }), [reports]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      window.open(`/api/export-excel?month=${selectedMonth}&year=${selectedYear}`, '_blank');
      setExporting(false);
      toast.success("File Rekap_Absensi.xlsx berhasil diunduh");
    }, 800);
  };

  const handlePrint = () => window.print();

  const loading = reportsLoading || departmentsLoading;

  if (loading) {
    return (
      <div className="space-y-6 animate-page-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#164e7f]">Laporan & Export</h1>
            <p className="text-sm text-slate-500">Rekapitulasi absensi dan export ke Excel</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 text-center">
                <div className="w-5 h-5 bg-slate-200 rounded mx-auto mb-1"></div>
                <div className="h-5 bg-slate-200 rounded w-12 mx-auto mb-1"></div>
                <div className="h-3 bg-slate-200 rounded w-16 mx-auto"></div>
              </CardContent>
            </Card>
          ))}
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
    <div className="space-y-6 animate-page-in print:space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#164e7f]">Laporan & Export</h1>
          <p className="text-sm text-slate-500">Rekapitulasi absensi dan export ke Excel</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" />Cetak</Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            Download Excel
          </Button>
        </div>
      </div>

      {exporting && (
        <Card className="border-[#039934]/30 bg-[#039934]/5 print:hidden">
          <CardContent className="py-3">
            <div className="flex items-center gap-4">
              <FileSpreadsheet className="w-6 h-6 text-[#039934] shrink-0 animate-pulse" />
              <p className="text-sm font-medium text-slate-700">Menyiapkan file Excel...</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3 flex-wrap print:hidden">
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">{monthLabel}</span>
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Departemen" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Departemen</SelectItem>
            {departmentsData.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input placeholder="Cari karyawan..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm bg-white" />
        </div>
        <Badge variant="outline" className="h-9 px-3 text-sm font-normal">{reports.length} karyawan</Badge>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 print:grid-cols-6 print:gap-2">
        <StatCard icon={CheckCircle} count={totals.hadir} label="Hadir" color="text-green-600" bg="border-green-200" />
        <StatCard icon={FileSpreadsheet} count={totals.sakit} label="Sakit" color="text-blue-600" bg="border-blue-200" />
        <StatCard icon={FileSpreadsheet} count={totals.izin} label="Izin" color="text-purple-600" bg="border-purple-200" />
        <StatCard icon={FileSpreadsheet} count={totals.cuti} label="Cuti" color="text-amber-600" bg="border-amber-200" />
        <StatCard icon={FileSpreadsheet} count={totals.alpa} label="Alpa" color="text-red-600" bg="border-red-200" />
        <StatCard icon={Clock} count={totals.terlambat} label="Terlambat" color="text-yellow-600" bg="border-yellow-200" />
      </div>

      <div className="flex items-center gap-2 flex-wrap print:hidden">
        <span className="text-sm font-medium text-slate-700">Keterangan:</span>
        {Object.entries(statusLabels).map(([code, label]) => (
          <Badge key={code} className={`${statusColors[code]} text-xs`}>{code} = {label}</Badge>
        ))}
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="print:p-0 print:mb-2">
          <CardTitle className="text-base print:text-lg">Rekapitulasi Absensi - {monthLabel}</CardTitle>
        </CardHeader>
        <CardContent className="print:p-0">
          <div className="overflow-x-auto">
            <Table className="print:text-[10px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40 print:w-auto cursor-pointer hover:text-[#164e7f]" onClick={() => toggleSort("employee_name")}>
                    <div className="flex items-center gap-1">Nama <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                  <TableHead>Divisi</TableHead>
                  {dayColumns.map(day => <TableHead key={day} className="text-center w-10 print:w-6">{day}</TableHead>)}
                  <TableHead className="text-center cursor-pointer hover:text-[#164e7f]" onClick={() => toggleSort("total_hadir")}>
                    <div className="flex items-center gap-1 justify-center">Total <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                  <TableHead className="text-center cursor-pointer hover:text-[#164e7f]" onClick={() => toggleSort("total_jam_kerja")}>
                    <div className="flex items-center gap-1 justify-center">Jam <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report, i) => (
                  <TableRow key={report.employee_id} className="animate-card-in print:animate-none" style={{ animationDelay: `${i * 20}ms` }}>
                    <TableCell>
                      <button onClick={() => { setDetailData(report); setDetailOpen(true); }} className="font-medium text-left hover:text-[#164e7f] transition-colors cursor-pointer">
                        {report.employee_name}
                      </button>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{report.department_name}</Badge></TableCell>
                    {dayColumns.map(day => {
                      const status = report.days[day] ?? "-";
                      return (
                        <TableCell key={day} className="text-center p-1">
                          {status !== "-" ? (
                            <Badge className={`${statusColors[status] ?? "bg-slate-300"} text-[10px] min-w-[22px] h-5 justify-center print:min-w-[16px] print:h-4 print:text-[8px]`}>
                              {status}
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-slate-300">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="font-bold text-center tabular-nums">{report.total_hadir}</TableCell>
                    <TableCell className="text-center tabular-nums text-sm">{report.total_jam_kerja.toFixed(1)}h</TableCell>
                  </TableRow>
                ))}
                {reports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={maxDays + 4} className="text-center py-12 text-slate-400">
                      <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Tidak ada data laporan</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {detailData && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detail Absensi</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold">{detailData.employee_name}</p>
                  <Badge variant="outline">{detailData.department_name}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Hadir" value={detailData.total_hadir} color="text-green-600" />
                <MiniStat label="Sakit" value={detailData.total_sakit} color="text-blue-600" />
                <MiniStat label="Izin" value={detailData.total_izin} color="text-purple-600" />
                <MiniStat label="Cuti" value={detailData.total_cuti} color="text-amber-600" />
                <MiniStat label="Alpa" value={detailData.total_alpa} color="text-red-600" />
                <MiniStat label="Terlambat" value={detailData.total_terlambat} color="text-yellow-600" />
              </div>
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-slate-700">Total Jam Kerja</p>
                <p className="text-2xl font-bold text-[#164e7f]">{detailData.total_jam_kerja.toFixed(1)} jam</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, count, label, color, bg }: { icon: React.ComponentType<{ className?: string }>; count: number; label: string; color: string; bg: string }) {
  return (
    <Card className={`border-2 hover:shadow-md transition-shadow ${bg}`}>
      <CardContent className="p-3 text-center">
        <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
        <p className={`text-xl font-bold tabular-nums ${color}`}>{count}</p>
        <p className="text-[10px] text-slate-500">{label}</p>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}
