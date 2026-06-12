"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Eye, FileText, AlertCircle, Search, CheckCheck, X } from "lucide-react";
import { toast } from "sonner";
import { useLeaveRequests } from "@/hooks/useData";
import { ApprovalDetail } from "@/components/features/ApprovalDetail";
import { RejectDialog } from "@/components/features/RejectDialog";
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

export default function ApprovalsPage() {
  const { data: leaveRequestsData, loading: leaveRequestsLoading } = useLeaveRequests();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState<LeaveRequest | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectRequest, setRejectRequest] = useState<LeaveRequest | null>(null);

  useEffect(() => {
    if (leaveRequestsData.length > 0) {
      setRequests(leaveRequestsData);
    }
  }, [leaveRequestsData]);

  const pending = useMemo(() => requests.filter(r => r.status === "pending"), [requests]);
  const approved = useMemo(() => requests.filter(r => r.status === "approved"), [requests]);
  const rejected = useMemo(() => requests.filter(r => r.status === "rejected"), [requests]);

  const getTabData = () => {
    let data = tab === "pending" ? pending : tab === "approved" ? approved : rejected;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(r => r.employee_name.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q));
    }
    if (filterType !== "all") data = data.filter(r => r.leave_type === filterType);
    return data.sort((a, b) => b.created_at.localeCompare(a.created_at));
  };

  const filtered = getTabData();

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allIds = new Set(filtered.map(r => r.id));
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(allIds);
    }
  };

  const handleApprove = (req: LeaveRequest) => {
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "approved" as LeaveStatus } : r));
    setSelected(prev => { const next = new Set(prev); next.delete(req.id); return next; });
    toast.success(`Pengajuan ${req.employee_name} disetujui`);
  };

  const handleReject = (req: LeaveRequest, reason: string) => {
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "rejected" as LeaveStatus } : r));
    setSelected(prev => { const next = new Set(prev); next.delete(req.id); return next; });
    toast.info(`Pengajuan ${req.employee_name} ditolak`);
  };

  const handleBulkApprove = () => {
    const ids = new Set(selected);
    setRequests(prev => prev.map(r => ids.has(r.id) ? { ...r, status: "approved" as LeaveStatus } : r));
    toast.success(`${selected.size} pengajuan disetujui`);
    setSelected(new Set());
  };

  const handleBulkReject = () => {
    const ids = new Set(selected);
    setRequests(prev => prev.map(r => ids.has(r.id) ? { ...r, status: "rejected" as LeaveStatus } : r));
    toast.info(`${selected.size} pengajuan ditolak`);
    setSelected(new Set());
  };

  const openDetail = (req: LeaveRequest) => { setDetailRequest(req); setDetailOpen(true); };
  const openReject = (req: LeaveRequest) => { setRejectRequest(req); setRejectOpen(true); };

  const tabCounts = { pending: pending.length, approved: approved.length, rejected: rejected.length };

  if (leaveRequestsLoading) {
    return (
      <div className="space-y-6 animate-page-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#164e7f]">Approval Center</h1>
            <p className="text-sm text-slate-500">Review dan approval pengajuan cuti/izin karyawan</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded"></div>
                <div>
                  <div className="h-6 bg-slate-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-20"></div>
                </div>
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
    <div className="space-y-6 animate-page-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#164e7f]">Approval Center</h1>
          <p className="text-sm text-slate-500">Review dan approval pengajuan cuti/izin karyawan</p>
        </div>
        {pending.length > 0 && (
          <Badge className="bg-amber-500 text-white px-3 py-1.5 text-sm">
            <AlertCircle className="w-4 h-4 mr-1.5" />
            {pending.length} Pending
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={AlertCircle} count={tabCounts.pending} label="Pending" color="text-amber-600" border="border-amber-200" />
        <StatCard icon={CheckCircle} count={tabCounts.approved} label="Disetujui" color="text-green-600" border="border-green-200" />
        <StatCard icon={XCircle} count={tabCounts.rejected} label="Ditolak" color="text-red-600" border="border-red-200" />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input placeholder="Cari nama atau alasan..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm bg-white" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Tipe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="cuti_tahunan">Cuti Tahunan</SelectItem>
            <SelectItem value="sakit">Sakit</SelectItem>
            <SelectItem value="izin">Izin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={v => { setTab(v); setSelected(new Set()); }} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="pending">Pending ({tabCounts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Disetujui ({tabCounts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak ({tabCounts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-base">
                {tab === "pending" ? "Pengajuan Menunggu Approval" : tab === "approved" ? "Riwayat Disetujui" : "Riwayat Ditolak"}
              </CardTitle>
              {tab === "pending" && selected.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{selected.size} dipilih</span>
                  <Button size="sm" className="h-7 text-xs bg-green-500 hover:bg-green-600" onClick={handleBulkApprove}>
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={handleBulkReject}>
                    <X className="w-3 h-3 mr-1" />
                    Tolak
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tab === "pending" && (
                        <TableHead className="w-10">
                          <Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onCheckedChange={toggleSelectAll} />
                        </TableHead>
                      )}
                      <TableHead>Karyawan</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="hidden md:table-cell">Alasan</TableHead>
                      <TableHead className="hidden sm:table-cell">Lampiran</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((req, i) => (
                      <TableRow
                        key={req.id}
                        className="animate-card-in cursor-pointer hover:bg-slate-50"
                        style={{ animationDelay: `${i * 30}ms` }}
                        onClick={() => openDetail(req)}
                      >
                        {tab === "pending" && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox checked={selected.has(req.id)} onCheckedChange={() => toggleSelect(req.id)} />
                          </TableCell>
                        )}
                        <TableCell>
                          <span className="font-medium text-left hover:text-[#164e7f] transition-colors">
                            {req.employee_name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{typeLabels[req.leave_type] ?? req.leave_type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {req.start_date === req.end_date ? req.start_date : `${req.start_date} - ${req.end_date}`}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate hidden md:table-cell text-sm text-slate-600">
                          {req.reason}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                          {req.attachment_url ? (
                            <a
                              href={req.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex"
                            >
                              <Badge className="bg-blue-500 text-white text-xs hover:bg-blue-600 cursor-pointer"><FileText className="w-3 h-3 mr-1" />Ada</Badge>
                            </a>
                          ) : <Badge variant="outline" className="text-xs">-</Badge>}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDetail(req)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            {req.status === "pending" && (
                              <>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => handleApprove(req)}>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => openReject(req)}>
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                            {req.status !== "pending" && (
                              <Badge className={`${statusConfig[req.status].color} text-white text-xs`}>
                                {statusConfig[req.status].label}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={tab === "pending" ? 7 : 6} className="text-center py-12 text-slate-400">
                          <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm">Tidak ada pengajuan</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {detailRequest && (
        <ApprovalDetail
          open={detailOpen}
          onOpenChange={setDetailOpen}
          request={detailRequest}
          onApprove={detailRequest.status === "pending" ? handleApprove : undefined}
          onReject={detailRequest.status === "pending" ? openReject : undefined}
        />
      )}

      {rejectRequest && (
        <RejectDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          employeeName={rejectRequest.employee_name}
          onReject={(reason) => handleReject(rejectRequest, reason)}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, count, label, color, border }: { icon: React.ComponentType<{ className?: string }>; count: number; label: string; color: string; border: string }) {
  return (
    <Card className={`border ${border}`}>
      <CardContent className="pt-4 flex items-center gap-3">
        <Icon className={`w-8 h-8 ${color}`} />
        <div>
          <p className={`text-2xl font-bold tabular-nums ${color}`}>{count}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
