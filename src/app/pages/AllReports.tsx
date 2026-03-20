import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { FileText, Search, Edit } from "lucide-react";
import { useAppLanguage } from "../lib/appLanguage";
import { getCurrentUser, getReports, updateReportStatus, type Report } from "../lib/mockData";
import { useAppDataRefresh } from "../lib/useAppDataRefresh";
import { toast } from "sonner";

export default function AllReports() {
  useAppDataRefresh();
  const user = getCurrentUser();
  const { language } = useAppLanguage();
  const t = language === "tl"
    ? {
        title: "Lahat ng Report",
        description: "Pamahalaan at i-update ang status ng reports",
        search: "Maghanap ng report...",
        allCategories: "Lahat ng Category",
        allStatus: "Lahat ng Status",
        pending: "Pending",
        inProgress: "In Progress",
        resolved: "Resolved",
        rejected: "Rejected",
        noReports: "Walang nahanap na report",
        submitted: "Naipasa",
        updated: "Na-update",
        updateTitle: "I-update ang Status ng Report",
        updateDesc: "Palitan ang status ng report para updated ang residents",
        reportTitle: "Pamagat ng Report",
        reportedBy: "Nireport ni",
        status: "Status",
        cancel: "Cancel",
        updateStatus: "I-update ang Status",
        updateSuccess: "Matagumpay na na-update ang status ng report!",
        updateError: "Hindi na-update ang status ng report. Kailangan ang admin access.",
      }
    : {
        title: "All Reports",
        description: "Manage and update report statuses",
        search: "Search reports...",
        allCategories: "All Categories",
        allStatus: "All Status",
        pending: "Pending",
        inProgress: "In Progress",
        resolved: "Resolved",
        rejected: "Rejected",
        noReports: "No reports found",
        submitted: "Submitted",
        updated: "Updated",
        updateTitle: "Update Report Status",
        updateDesc: "Change the status of this report to keep residents informed",
        reportTitle: "Report Title",
        reportedBy: "Reported By",
        status: "Status",
        cancel: "Cancel",
        updateStatus: "Update Status",
        updateSuccess: "Report status updated successfully!",
        updateError: "Failed to update report status. Admin access is required.",
      };
  const [reports, setReports] = useState<Report[]>(getReports());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editedStatus, setEditedStatus] = useState("");

  if (!user) return null;

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleEditClick = (report: Report) => {
    setSelectedReport(report);
    setEditedStatus(report.status);
    setDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (selectedReport) {
      const updated = await updateReportStatus(
        selectedReport.id,
        editedStatus as "pending" | "in-progress" | "resolved" | "rejected",
      );
      if (!updated) {
        toast.error(t.updateError);
        return;
      }

      setReports(getReports());
      toast.success(t.updateSuccess);
      setDialogOpen(false);
    }
  };

  const getStatusVariant = (status: string): "outline" | "secondary" | "default" | "destructive" => {
    switch (status) {
      case "pending":
        return "outline";
      case "in-progress":
        return "secondary";
      case "resolved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 border-red-600";
      case "medium":
        return "text-yellow-600 border-yellow-600";
      case "low":
        return "text-green-600 border-green-600";
      default:
        return "text-gray-600 border-gray-600";
    }
  };

  return (
    <AppShell title={t.title} description={t.description}>
      <Card className="mb-6 border-white/80 bg-white/90 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCategories}</SelectItem>
                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                <SelectItem value="Sanitation">Sanitation</SelectItem>
                <SelectItem value="Public Safety">Public Safety</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Environment">Environment</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatus}</SelectItem>
                <SelectItem value="pending">{t.pending}</SelectItem>
                <SelectItem value="in-progress">{t.inProgress}</SelectItem>
                <SelectItem value="resolved">{t.resolved}</SelectItem>
                <SelectItem value="rejected">{t.rejected}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card className="border-white/80 bg-white/90 shadow-sm">
            <CardContent className="py-12 text-center text-slate-500">
              <FileText className="mx-auto mb-2 h-12 w-12 text-slate-400" />
              <p>{t.noReports}</p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="border-white/80 bg-white/90 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="mb-1">{report.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span>By {report.userName}</span>
                      <span>|</span>
                      <span>{report.category}</span>
                      <span>|</span>
                      <span>{report.location}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                    <Button size="sm" variant="outline" className="rounded-lg border-slate-200" onClick={() => handleEditClick(report)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-slate-700">{report.description}</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 sm:gap-4">
                    <span>{t.submitted}: {report.createdAt.toLocaleDateString()}</span>
                    <span className="hidden sm:inline">|</span>
                    <span>{t.updated}: {report.updatedAt.toLocaleDateString()}</span>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(report.priority)}>
                    {report.priority} priority
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.updateTitle}</DialogTitle>
            <DialogDescription>{t.updateDesc}</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{t.reportTitle}</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedReport.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">{t.reportedBy}</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedReport.userName}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t.status}</Label>
                <Select value={editedStatus} onValueChange={setEditedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t.pending}</SelectItem>
                    <SelectItem value="in-progress">{t.inProgress}</SelectItem>
                    <SelectItem value="resolved">{t.resolved}</SelectItem>
                    <SelectItem value="rejected">{t.rejected}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleUpdateStatus}>{t.updateStatus}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
