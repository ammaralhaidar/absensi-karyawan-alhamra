"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface AnomalyRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  department_name: string;
  date: string;
  check_in: string;
  check_out: string | null;
  status_in: string;
  anomaly_flag: string;
}

export function AnomalyTable() {
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAnomalies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance_logs")
      .select(
        "id, employee_id, date, check_in, check_out, status_in, anomaly_flag, employees(name, departments(name))"
      )
      .eq("anomaly_flag", "lupa_checkout")
      .order("date", { ascending: false })
      .limit(50);

    if (!error && data) {
      setAnomalies(
        data.map((a: Record<string, any>) => ({
          id: a.id,
          employee_id: a.employee_id,
          employee_name: Array.isArray(a.employees)
            ? a.employees[0]?.name
            : a.employees?.name ?? "",
          department_name: Array.isArray(a.employees)
            ? (a.employees[0]?.departments as any)?.name
            : (a.employees as any)?.departments?.name ?? "",
          date: a.date,
          check_in: a.check_in,
          check_out: a.check_out,
          status_in: a.status_in,
          anomaly_flag: a.anomaly_flag,
        }))
      );
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  const handleResolve = async (id: string) => {
    const { error } = await supabase
      .from("attendance_logs")
      .update({ anomaly_flag: null })
      .eq("id", id);

    if (error) {
      toast.error("Gagal: " + error.message);
    } else {
      toast.success("Anomali berhasil diresolve");
      setAnomalies((prev) => prev.filter((a) => a.id !== id));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-base">Anomali — Lupa Checkout</CardTitle>
          </div>
          <Badge className="bg-amber-500">{anomalies.length} data</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
            <p className="text-sm">Tidak ada anomali</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Jam Masuk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anomalies.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs">{a.date}</TableCell>
                  <TableCell className="font-medium text-sm">
                    {a.employee_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {a.department_name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {new Date(a.check_in).toLocaleTimeString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-amber-500 text-xs">
                      Lupa Checkout
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleResolve(a.id)}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Resolve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
