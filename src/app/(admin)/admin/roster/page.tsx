"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Calendar, Copy, Grid, List, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { useEmployees, useShifts, useDepartments, useRoster } from "@/hooks/useData";
import { copyRosterFromPreviousMonth } from "@/lib/data/rosters";
import type { RosterEntry } from "@/types";

const shiftColors: Record<string, { bg: string; text: string }> = {
  "Shift Pagi": { bg: "bg-blue-100 border-blue-300", text: "text-blue-700" },
  "Shift Siang": { bg: "bg-amber-100 border-amber-300", text: "text-amber-700" },
  "Shift Malam": { bg: "bg-indigo-100 border-indigo-300", text: "text-indigo-700" },
  "Off": { bg: "bg-slate-100 border-slate-200", text: "text-slate-400" },
};

function getShiftColor(name: string) {
  return shiftColors[name] ?? shiftColors["Off"];
}

function isWeekend(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export default function RosterPage() {
  const { data: employeesData, loading: employeesLoading } = useEmployees();
  const { data: shiftsData, loading: shiftsLoading } = useShifts();
  const { data: departmentsData, loading: departmentsLoading } = useDepartments();
  
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1)); // June 2026
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  const daysInMonth = getDaysInMonth(year, month);
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
  
  const { data: rosterData, loading: rosterLoading } = useRoster(monthStart, monthEnd);
  
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [view, setView] = useState<"table" | "grid">("grid");
  const [filterDept, setFilterDept] = useState("all");
  const [copyOpen, setCopyOpen] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (rosterData.length > 0) {
      setRoster(rosterData);
    }
  }, [rosterData]);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const rosterEmployees = employeesData.filter(e => e.role !== "admin" && e.is_active);

  const filteredEmps = useMemo(() => {
    if (filterDept === "all") return rosterEmployees;
    return rosterEmployees.filter(e => e.department_id === filterDept);
  }, [filterDept, rosterEmployees]);

  const shiftMap = [...shiftsData, { id: "off", name: "Off", start_time: "-", end_time: "-", late_tolerance_minutes: 0, is_default: false }];

  const getShift = (empId: string, day: number) => {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return roster.find(r => r.employee_id === empId && r.date === date);
  };

  const setShift = (empId: string, day: number, shiftId: string, shiftName: string) => {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const emp = employeesData.find(e => e.id === empId);
    if (!emp) return;
    
    setRoster(prev => {
      const filtered = prev.filter(r => !(r.employee_id === empId && r.date === date));
      if (shiftId === "off") return filtered;
      return [...filtered, { 
        id: `rost-${empId}-${day}-${Date.now()}`, 
        employee_id: empId, 
        employee_name: emp.name, 
        department_name: emp.department_name, 
        date, 
        shift_id: shiftId, 
        shift_name: shiftName 
      }];
    });
    toast.success(`${emp.name} → ${shiftName} (${date})`);
  };

  const handleBulkWeekend = () => {
    const weekendDays = days.filter(d => isWeekend(`${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`));
    setRoster(prev => prev.filter(r => !weekendDays.some(d => {
      const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      return r.date === date;
    })));
    toast.info("Weekend dibersihkan (Off)");
  };

  const handleCopyMay = async () => {
    setCopying(true);
    try {
      const result = await copyRosterFromPreviousMonth();
      if (result.copied > 0) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
    } catch (err: any) {
      toast.error("Gagal: " + err.message);
    } finally {
      setCopying(false);
      setCopyOpen(false);
    }
  };

  const handleSave = () => {
    toast.success("Roster berhasil disimpan");
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const loading = employeesLoading || shiftsLoading || departmentsLoading || rosterLoading;

  if (loading) {
    return (
      <div className="space-y-6 animate-page-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#164e7f]">Manajemen Roster</h1>
            <p className="text-sm text-slate-500">Jadwal shift karyawan</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-5 h-5 bg-slate-200 rounded"></div>
                <div>
                  <div className="h-5 bg-slate-200 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-16"></div>
                </div>
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
          <h1 className="text-2xl font-bold text-[#164e7f]">Manajemen Roster</h1>
          <p className="text-sm text-slate-500">Jadwal shift karyawan — {monthNames[month - 1]} {year}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCopyOpen(true)} disabled={copying}>
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            {copying ? "Menyalin..." : "Copy Bulan Lalu"}
          </Button>
          <Button size="sm" className="bg-[#039934] hover:bg-[#027a2a]" onClick={handleSave}>Simpan Roster</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <Button variant="ghost" size="sm" className={`h-8 ${view === "grid" ? "bg-white shadow-sm" : ""}`} onClick={() => setView("grid")}>
            <Grid className="w-3.5 h-3.5 mr-1.5" /> Grid
          </Button>
          <Button variant="ghost" size="sm" className={`h-8 ${view === "table" ? "bg-white shadow-sm" : ""}`} onClick={() => setView("table")}>
            <List className="w-3.5 h-3.5 mr-1.5" /> Tabel
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-2">
            {monthNames[month - 1]} {year}
          </span>
          <Button variant="outline" size="sm" className="h-8" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-40 h-8 text-sm"><SelectValue placeholder="Semua Dept." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Dept.</SelectItem>
            {departmentsData.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleBulkWeekend} className="h-8 text-xs">Weekend → Off</Button>
        <Badge variant="outline" className="h-8 px-3 text-sm font-normal">{filteredEmps.length} karyawan</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Karyawan" value={rosterEmployees.length} color="text-[#164e7f]" />
        <StatCard icon={Clock} label="Shift Pagi" value={roster.filter(r => r.shift_id === "shift-1").length} color="text-blue-600" />
        <StatCard icon={Clock} label="Shift Siang" value={roster.filter(r => r.shift_id === "shift-2").length} color="text-amber-600" />
        <StatCard icon={Clock} label="Shift Malam" value={roster.filter(r => r.shift_id === "shift-3").length} color="text-indigo-600" />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs flex-wrap print:hidden">
        <span className="text-slate-500 font-medium">Shift:</span>
        {shiftsData.slice(0, 3).map(s => (
          <Badge key={s.id} className={`${getShiftColor(s.name).bg} ${getShiftColor(s.name).text} border`}>{s.name}</Badge>
        ))}
        <Badge className="bg-slate-100 text-slate-400 border">Off</Badge>
        <span className="text-slate-300">|</span>
        <Badge className="bg-red-50 text-red-500 border border-red-200">🔴 Libur</Badge>
        <Badge className="bg-slate-50 text-slate-400 border">⚫ Weekend</Badge>
      </div>

      {view === "grid" ? (
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Header row: days */}
            <div className="flex sticky top-0 z-10 bg-white border-b pb-2 mb-1">
              <div className="w-36 shrink-0 font-medium text-xs text-slate-500 px-2">Karyawan</div>
              <div className="flex gap-1">
                {days.map(day => {
                  const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const we = isWeekend(date);
                  return (
                    <div key={day} className="w-10 text-center">
                      <p className={`text-[10px] font-bold ${we ? "text-slate-400" : "text-slate-600"}`}>
                        {day}
                      </p>
                      <p className="text-[8px] text-slate-400">
                        {["Mg","Sn","Sl","Rb","Km","Jm","Sb"][new Date(date).getDay()]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {filteredEmps.map((emp, ei) => (
              <div key={emp.id} className="flex items-center border-b border-slate-50 py-0.5 animate-card-in" style={{ animationDelay: `${ei * 40}ms` }}>
                <div className="w-36 shrink-0 px-2 py-1">
                  <p className="text-xs font-medium text-slate-700 truncate">{emp.name}</p>
                  <p className="text-[10px] text-slate-400">{emp.department_name}</p>
                </div>
                <div className="flex gap-1">
                  {days.map(day => {
                    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const entry = getShift(emp.id, day);
                    const we = isWeekend(date);
                    const bg = we ? "bg-slate-50 border-slate-100" : entry ? getShiftColor(entry.shift_name).bg : "bg-white border-slate-100";
                    return (
                      <div key={day} className="relative group">
                        <Select value={entry?.shift_id ?? "off"} onValueChange={(v) => {
                          const s = shiftMap.find(x => x.id === v);
                          if (s) setShift(emp.id, day, v, s.name);
                        }}>
                          <SelectTrigger className={`w-10 h-8 p-0 border rounded text-[10px] font-medium cursor-pointer hover:ring-1 ring-[#164e7f]/30 transition-all ${bg} ${entry ? getShiftColor(entry.shift_name).text : "text-slate-300"}`}>
                            <SelectValue>
                              {entry ? entry.shift_name.charAt(0) : we ? "" : ""}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent align="start" className="min-w-[100px]">
                            {shiftMap.map(s => (
                              <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Roster — {monthNames[month - 1]} {year}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">Karyawan</TableHead>
                    <TableHead>Dept.</TableHead>
                    <TableHead>Default Shift</TableHead>
                    {days.slice(0, 7).map(day => {
                      const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      return <TableHead key={day} className="text-center w-12">{day}</TableHead>;
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmps.map((emp, i) => (
                    <TableRow key={emp.id} className="animate-card-in" style={{ animationDelay: `${i * 30}ms` }}>
                      <TableCell className="font-medium text-sm">{emp.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{emp.department_name}</Badge></TableCell>
                      <TableCell><Badge className="bg-[#039934] text-white text-xs">{emp.shift_name}</Badge></TableCell>
                      {days.slice(0, 7).map(day => {
                        const entry = getShift(emp.id, day);
                        const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const we = isWeekend(date);
                        return (
                          <TableCell key={day} className="text-center p-1">
                            <Select value={entry?.shift_id ?? "off"} onValueChange={(v) => {
                              const s = shiftMap.find(x => x.id === v);
                              if (s) setShift(emp.id, day, v, s.name);
                            }}>
                              <SelectTrigger className={`w-10 h-7 mx-auto p-0 border rounded text-[10px] font-medium ${entry ? getShiftColor(entry.shift_name).bg + " " + getShiftColor(entry.shift_name).text : "bg-white border-slate-100 text-slate-300"}`}>
                                <SelectValue>{entry ? entry.shift_name.charAt(0) : we ? "" : "-"}</SelectValue>
                              </SelectTrigger>
                              <SelectContent align="start" className="min-w-[100px]">
                                {shiftMap.map(s => (
                                  <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={copyOpen} onOpenChange={setCopyOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Copy dari Bulan Sebelumnya</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Salin roster {monthNames[month - 2] ?? "bulan sebelumnya"} ke {monthNames[month - 1]}? Data roster saat ini akan ditimpa.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyOpen(false)} disabled={copying}>Batal</Button>
            <Button className="bg-[#164e7f]" onClick={handleCopyMay} disabled={copying}>
              {copying ? "Menyalin..." : "Ya, Copy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-3 flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <div>
          <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
