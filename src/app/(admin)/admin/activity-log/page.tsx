import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScanLine, CheckCircle, FileText, UserPen, Clock } from "lucide-react";
import { getAdminActivities } from "@/lib/data/hybrid";

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  scan: ScanLine,
  approval: CheckCircle,
  leave_request: FileText,
  employee_update: UserPen,
};

const typeLabel: Record<string, string> = {
  scan: "Scan",
  approval: "Approval",
  leave_request: "Pengajuan",
  employee_update: "Update",
};

const typeColor: Record<string, string> = {
  scan: "bg-blue-500",
  approval: "bg-green-500",
  leave_request: "bg-amber-500",
  employee_update: "bg-purple-500",
};

export default async function ActivityLogPage() {
  const activities = await getAdminActivities();

  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="text-2xl font-bold text-[#164e7f]">Activity Log</h1>
        <p className="text-sm text-slate-500">Riwayat aktivitas sistem dan admin</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Semua Aktivitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Deskripsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity, i) => {
                  const Icon = typeIcon[activity.type] ?? FileText;
                  return (
                    <TableRow key={activity.id} className="animate-card-in" style={{ animationDelay: `${i * 30}ms` }}>
                      <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                        {new Date(activity.timestamp).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${typeColor[activity.type]} text-white text-xs`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {typeLabel[activity.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{activity.user_name}</TableCell>
                      <TableCell className="text-sm text-slate-600">{activity.description}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
