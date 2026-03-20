import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Download,
  FileText,
  FileSpreadsheet,
  KeyRound,
  Lock,
  Megaphone,
  OctagonAlert,
  Shield,
  LifeBuoy,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  clearUserFailedAttempts,
  createAnnouncement,
  getAnnouncements,
  getAnnouncementsForCurrentUser,
  getCurrentUser,
  getReports,
  getSecurityAccounts,
  getSystemSettings,
  getUsers,
  type Announcement,
  type Report,
  resetUserPassword,
  setUserLockState,
  type SecurityAccount,
  type SystemSettings,
  updateReportEscalation,
  updateReportStatus,
  updateSystemSettings,
} from "../lib/mockData";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { useAppLanguage } from "../lib/appLanguage";
import { useAppDataRefresh } from "../lib/useAppDataRefresh";

const chartColors = ["#0f766e", "#06b6d4", "#0ea5e9", "#10b981", "#f59e0b", "#64748b"];

const sampleUnusedCodes = [
  { code: "RES-041", type: "Resident", status: "available" },
  { code: "RES-042", type: "Resident", status: "available" },
  { code: "CAP-ADMIN-002", type: "Captain", status: "available" },
  { code: "KWD-ACCESS-008", type: "Kagawad", status: "available" },
  { code: "SUPER-ADMIN-002", type: "Super Admin", status: "reserved" },
] as const;

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString(undefined, {
    month: "short",
  });

export default function AdminDashboard() {
  useAppDataRefresh();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { language } = useAppLanguage();
  const t = language === "tl"
    ? {
        adminTitle: "Admin Dashboard",
        adminDescription: "Pamahalaan ang reports at bantayan ang galaw sa barangay",
        superTitle: "Welcome, Super Admin!",
        superDescription: "May buo kang kontrol sa Barangay Digital Reporting System, kasama ang monitoring, user management, at system configuration.",
        exportSummary: "Export Summary",
        securityReview: "Security Review",
        totalReports: "Kabuuang Report",
        activeUsers: "Active Users",
        pendingApprovals: "Pending Approvals",
        urgentReports: "Urgent Reports",
        topIssue: "Top Issue",
        announcements: "Announcements",
        recentReports: "Recent Reports",
        noAnnouncements: "Wala pang announcements.",
        noReports: "Wala pang report sa view na ito.",
        userManagement: "User Management",
        accessCodes: "Access Code Management",
        snapshot: "Super Admin Snapshot",
        monitoring: "System-Wide Report Monitoring",
        announcementSystem: "Announcement System",
        incidentEscalation: "Incident Escalation",
        auditLogs: "Audit Logs",
        systemSettings: "System Settings",
        securityManagement: "Security Management",
        roleExport: "Role & Export Controls",
      }
    : {
        adminTitle: "Admin Dashboard",
        adminDescription: "Manage reports and monitor barangay activities",
        superTitle: "Welcome, Super Admin!",
        superDescription: "You have full administrative control over the Barangay Digital Reporting System, including monitoring, user management, and system configuration.",
        exportSummary: "Export Summary",
        securityReview: "Security Review",
        totalReports: "Total Reports",
        activeUsers: "Active Users",
        pendingApprovals: "Pending Approvals",
        urgentReports: "Urgent Reports",
        topIssue: "Top Issue",
        announcements: "Announcements",
        recentReports: "Recent Reports",
        noAnnouncements: "No announcements available yet.",
        noReports: "No reports found for the selected view.",
        userManagement: "User Management",
        accessCodes: "Access Code Management",
        snapshot: "Super Admin Snapshot",
        monitoring: "System-Wide Report Monitoring",
        announcementSystem: "Announcement System",
        incidentEscalation: "Incident Escalation",
        auditLogs: "Audit Logs",
        systemSettings: "System Settings",
        securityManagement: "Security Management",
        roleExport: "Role & Export Controls",
      };
  const [announcementAudience, setAnnouncementAudience] = useState<"all" | "residents" | "officials">("all");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>(getAnnouncements());
  const [reportStatusView, setReportStatusView] = useState<"all" | "pending" | "in-progress" | "resolved">("all");
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [escalationDialogOpen, setEscalationDialogOpen] = useState(false);
  const [selectedEscalationReportId, setSelectedEscalationReportId] = useState<string | null>(null);
  const [selectedOfficialId, setSelectedOfficialId] = useState<string>("");
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(getSystemSettings());
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<SystemSettings>(getSystemSettings());
  const [securityManagementDialogOpen, setSecurityManagementDialogOpen] = useState(false);
  const [securityAccounts, setSecurityAccounts] = useState<SecurityAccount[]>(getSecurityAccounts());
  const [selectedSecurityAccountId, setSelectedSecurityAccountId] = useState<string>("");
  const [passwordResetValue, setPasswordResetValue] = useState("");

  if (!user) return null;

  const reports = getReports();
  const users = getUsers();
  const isSuperAdmin = user.accountType === "super_admin";
  const visibleAnnouncements = getAnnouncementsForCurrentUser();

  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === "pending").length;
  const inProgressReports = reports.filter((r) => r.status === "in-progress").length;
  const resolvedReports = reports.filter((r) => r.status === "resolved").length;
  const residentUsers = users.filter((u) => u.accountType === "resident");
  const activeUsers = users.filter((u) => u.verificationStatus === "approved").length;
  const pendingUsers = users.filter((u) => u.verificationStatus === "pending");
  const officialUsers = users.filter((u) => u.accountType === "official");
  const superAdmins = users.filter((u) => u.accountType === "super_admin");
  const unresolvedReports = reports.filter((r) => r.status !== "resolved" && r.status !== "rejected");
  const urgentReports = reports.filter((r) => r.priority === "high" && r.status !== "resolved");
  const usedCodes = users
    .map((u) => u.accessCode)
    .filter((code): code is string => Boolean(code))
    .slice(0, 5)
    .map((code) => ({ code, type: code.startsWith("RES-") ? "Resident" : code.startsWith("SUPER-") ? "Super Admin" : "Official", status: "used" as const }));

  const categoryData = systemSettings.reportCategories.map((category, index) => ({
    name: category,
    count: reports.filter((report) => report.category === category).length,
    color: chartColors[index % chartColors.length],
  }));

  const topIssue =
    [...categoryData].sort((a, b) => b.count - a.count)[0]?.name ?? "No data yet";

  const monthlyTrendData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, offset) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - offset), 1);
      const matching = reports.filter(
        (report) =>
          report.createdAt.getMonth() === date.getMonth() &&
          report.createdAt.getFullYear() === date.getFullYear(),
      );

      return {
        month: getMonthLabel(date),
        reports: matching.length,
        resolved: matching.filter((report) => report.status === "resolved").length,
      };
    });
  }, [reports]);

  const filteredMonitoringReports = reports.filter((report) =>
    reportStatusView === "all" ? true : report.status === reportStatusView,
  );
  const selectedEscalationReport = selectedEscalationReportId
    ? reports.find((report) => report.id === selectedEscalationReportId) ?? null
    : null;
  const selectedSecurityAccount = selectedSecurityAccountId
    ? securityAccounts.find((account) => account.id === selectedSecurityAccountId) ?? null
    : null;
  const failedLoginCount = securityAccounts.reduce((sum, account) => sum + account.failedLoginAttempts, 0);
  const lockedAccountsCount = securityAccounts.filter((account) => account.lockedUntil && new Date(account.lockedUntil).getTime() > Date.now()).length;
  const passwordResetCandidates = securityAccounts.filter((account) => account.failedLoginAttempts > 0 || Boolean(account.lockedUntil)).length;

  const announcementAudienceCount =
    announcementAudience === "all" ? users.length : announcementAudience === "residents" ? residentUsers.length : officialUsers.length;

  const auditLogs = [
    {
      actor: user.name,
      action: "Logged in to the Super Admin dashboard",
      time: "Just now",
      type: "login",
    },
    {
      actor: pendingUsers[0]?.name ?? "System",
      action: pendingUsers.length ? "Submitted a new account registration" : "No pending registrations detected",
      time: "10 mins ago",
      type: "registration",
    },
    {
      actor: urgentReports[0]?.userName ?? "Reports Queue",
      action: urgentReports.length ? `Flagged "${urgentReports[0].title}" as high priority` : "No urgent report escalation yet",
      time: "22 mins ago",
      type: "escalation",
    },
    {
      actor: officialUsers[0]?.name ?? "Barangay Official",
      action: officialUsers.length ? "Reviewed active report assignments" : "No official activity recorded",
      time: "1 hour ago",
      type: "management",
    },
  ];

  const handleExportSummary = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      generatedBy: user.name,
      summary: {
        totalReports,
        pendingReports,
        inProgressReports,
        resolvedReports,
        activeUsers,
        pendingUsers: pendingUsers.length,
        urgentReports: urgentReports.length,
        announcements: announcements.length,
      },
      topIssue,
      monthlyTrendData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `super-admin-summary-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Summary exported successfully.");
  };

  const handleExportReportsCsv = () => {
    const headers = ["Title", "Category", "Status", "Priority", "Location", "Reported By", "Created At"];
    const rows = reports.map((report) => [
      report.title,
      report.category,
      report.status,
      report.priority,
      report.location,
      report.userName,
      report.createdAt.toLocaleDateString(),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `reports-export-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("CSV export downloaded.");
  };

  const handleGenerateMeetingSummary = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Unable to open the meeting summary window.");
      return;
    }

    const html = `
      <html>
        <head>
          <title>Meeting Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
            h1, h2 { margin-bottom: 8px; }
            .card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
            ul { padding-left: 20px; }
          </style>
        </head>
        <body>
          <h1>Barangay Digital Reporting System</h1>
          <p>Meeting summary generated on ${new Date().toLocaleString()}</p>
          <div class="card">
            <h2>Overview</h2>
            <p>Total Reports: ${totalReports}</p>
            <p>Pending Reports: ${pendingReports}</p>
            <p>In Progress: ${inProgressReports}</p>
            <p>Resolved Reports: ${resolvedReports}</p>
            <p>Most Reported Issue: ${topIssue}</p>
          </div>
          <div class="card">
            <h2>Urgent Reports</h2>
            <ul>
              ${urgentReports.length ? urgentReports.map((report) => `<li>${report.title} - ${report.location}</li>`).join("") : "<li>No urgent reports at this time.</li>"}
            </ul>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    toast.success("Meeting summary opened for printing.");
  };

  const refreshSecurityAccounts = () => {
    const accounts = getSecurityAccounts();
    setSecurityAccounts(accounts);
    setSelectedSecurityAccountId((current) => {
      if (current && accounts.some((account) => account.id === current)) return current;
      return accounts[0]?.id ?? "";
    });
  };

  const openSettingsDialog = () => {
    const currentSettings = getSystemSettings();
    setSystemSettings(currentSettings);
    setSettingsDraft(currentSettings);
    setSettingsDialogOpen(true);
  };

  const handleSaveSystemSettings = async () => {
    const nextSettings = await updateSystemSettings(settingsDraft);
    if (!nextSettings) {
      toast.error("Unable to save system settings.");
      return;
    }

    setSystemSettings(nextSettings);
    setSettingsDraft(nextSettings);
    setSettingsDialogOpen(false);
    toast.success("System settings updated.");
  };

  const openSecurityManagement = () => {
    const accounts = getSecurityAccounts();
    setSecurityAccounts(accounts);
    setSelectedSecurityAccountId(accounts[0]?.id ?? "");
    setPasswordResetValue("");
    setSecurityManagementDialogOpen(true);
  };

  const handleClearFailedAttempts = async () => {
    if (!selectedSecurityAccount) return;
    const cleared = await clearUserFailedAttempts(selectedSecurityAccount.id);
    if (!cleared) {
      toast.error("Unable to clear failed login attempts.");
      return;
    }
    refreshSecurityAccounts();
    toast.success(`Failed login attempts cleared for ${selectedSecurityAccount.name}.`);
  };

  const handleToggleLockState = async () => {
    if (!selectedSecurityAccount) return;
    const locked = !(selectedSecurityAccount.lockedUntil && new Date(selectedSecurityAccount.lockedUntil).getTime() > Date.now());
    const updated = await setUserLockState(selectedSecurityAccount.id, locked);
    if (!updated) {
      toast.error("Unable to update account lock state.");
      return;
    }
    refreshSecurityAccounts();
    toast.success(locked ? `${selectedSecurityAccount.name} has been locked.` : `${selectedSecurityAccount.name} has been unlocked.`);
  };

  const handlePasswordReset = async () => {
    if (!selectedSecurityAccount) return;
    const reset = await resetUserPassword(selectedSecurityAccount.id, passwordResetValue);
    if (!reset) {
      toast.error("Password reset failed. Use at least 8 characters with uppercase, lowercase, and a number.");
      return;
    }
    refreshSecurityAccounts();
    setPasswordResetValue("");
    toast.success(`Password reset for ${selectedSecurityAccount.name}.`);
  };

  const openEscalationDialog = (report: Report) => {
    setSelectedEscalationReportId(report.id);
    setSelectedOfficialId(report.assignedOfficialId ?? "");
    setEscalationDialogOpen(true);
  };

  const handleAssignOfficial = async () => {
    if (!selectedEscalationReport) return;
    if (!selectedOfficialId) {
      toast.error("Please choose an official to assign.");
      return;
    }

    const updated = await updateReportEscalation(selectedEscalationReport.id, {
      assignedOfficialId: selectedOfficialId,
      priority: "high",
      status: selectedEscalationReport.status === "pending" ? "in-progress" : selectedEscalationReport.status,
    });

    if (!updated) {
      toast.error("Unable to assign this report right now.");
      return;
    }

    setEscalationDialogOpen(false);
    toast.success(`Assigned ${updated.title} to ${updated.assignedOfficialName}.`);
  };

  const handleEscalationStatusChange = async (status: Report["status"]) => {
    if (!selectedEscalationReport) return;

    const updated = await updateReportStatus(selectedEscalationReport.id, status);
    if (!updated) {
      toast.error("Unable to update the report status.");
      return;
    }

    setSelectedEscalationReportId(updated.id);
    if (status === "resolved") {
      setEscalationDialogOpen(false);
    }
    toast.success(`Report marked as ${status}.`);
  };

  if (!isSuperAdmin) {
    const recentReports = reports.slice(0, 5);

    return (
      <AppShell title={t.adminTitle} description={t.adminDescription}>
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard title="Total Reports" value={totalReports} subtitle="All time" icon={<FileText className="h-4 w-4 text-slate-500" />} />
          <MetricCard title="Pending" value={pendingReports} subtitle="Needs attention" icon={<Clock className="h-4 w-4 text-yellow-500" />} />
          <MetricCard title="In Progress" value={inProgressReports} subtitle="Being addressed" icon={<AlertCircle className="h-4 w-4 text-blue-500" />} />
          <MetricCard title="Resolved" value={resolvedReports} subtitle="Completed" icon={<CheckCircle className="h-4 w-4 text-green-500" />} />
          <MetricCard title="Total Users" value={residentUsers.length} subtitle="Registered residents" icon={<Users className="h-4 w-4 text-slate-500" />} />
        </div>

        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader>
          <CardTitle>{t.recentReports}</CardTitle>
            <CardDescription>Latest reports from residents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-slate-600">
                        By {report.userName} | {report.category} | {report.location}
                      </p>
                    </div>
                    <Badge variant={report.status === "resolved" ? "default" : report.status === "in-progress" ? "secondary" : "outline"}>
                      {report.status}
                    </Badge>
                  </div>
                  <p className="mb-2 text-sm text-slate-600">{report.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Submitted {report.createdAt.toLocaleDateString()}</p>
                    <Badge
                      variant="outline"
                      className={
                        report.priority === "high"
                          ? "border-red-600 text-red-600"
                          : report.priority === "medium"
                          ? "border-yellow-600 text-yellow-600"
                          : "border-green-600 text-green-600"
                      }
                    >
                      {report.priority} priority
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-white/80 bg-white/90 shadow-sm">
          <CardHeader>
          <CardTitle>{t.announcements}</CardTitle>
            <CardDescription>Updates shared with your account</CardDescription>
          </CardHeader>
          <CardContent>
            {visibleAnnouncements.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                {t.noAnnouncements}
              </div>
            ) : (
              <div className="space-y-3">
                {visibleAnnouncements.slice(0, 4).map((announcement) => (
                  <div key={announcement.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{announcement.title}</p>
                      <Badge variant="outline">{announcement.audience}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{announcement.message}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Posted by {announcement.createdBy} on {announcement.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const handlePostAnnouncement = async () => {
    const created = await createAnnouncement({
      title: announcementTitle,
      message: announcementMessage,
      audience: announcementAudience,
    });

    if (!created) {
      toast.error("Please enter both an announcement title and message.");
      return;
    }

    setAnnouncements(getAnnouncements());
    setAnnouncementTitle("");
    setAnnouncementMessage("");
    toast.success("Announcement posted successfully.");
  };

  return (
    <AppShell
      title={t.superTitle}
      description={t.superDescription}
      headerActions={
        <>
          <Button variant="outline" className="w-full rounded-xl border-slate-200 bg-white sm:w-auto" onClick={handleExportSummary}>
            <Download className="mr-2 h-4 w-4" />
            {t.exportSummary}
          </Button>
          <Button className="w-full rounded-xl bg-teal-700 hover:bg-teal-800 sm:w-auto" onClick={() => setSecurityDialogOpen(true)}>
            <Shield className="mr-2 h-4 w-4" />
            {t.securityReview}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title={t.totalReports} value={totalReports} subtitle="System-wide report count" icon={<FileText className="h-4 w-4 text-slate-500" />} />
        <MetricCard title={t.activeUsers} value={activeUsers} subtitle="Approved accounts" icon={<Users className="h-4 w-4 text-cyan-700" />} />
        <MetricCard title={t.pendingApprovals} value={pendingUsers.length} subtitle="Needs review" icon={<UserCog className="h-4 w-4 text-amber-600" />} />
        <MetricCard title={t.urgentReports} value={urgentReports.length} subtitle="High priority queue" icon={<OctagonAlert className="h-4 w-4 text-rose-600" />} />
        <MetricCard title={t.topIssue} value={topIssue} subtitle="Most reported category" icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-6">
          <Card className="border-white/80 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>{t.userManagement}</CardTitle>
              <CardDescription>Approve, reject, activate, deactivate, and update user accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <MiniAction label="Approve / Reject" value={pendingUsers.length} hint="Pending registrations" icon={<UserCog className="h-4 w-4 text-amber-600" />} />
                <MiniAction label="Active Accounts" value={activeUsers} hint="Approved and active" icon={<CheckCircle className="h-4 w-4 text-emerald-600" />} />
              </div>
              <Input placeholder="Search & filter users..." className="h-11 rounded-xl border-slate-200 bg-white" />
              <div className="space-y-3">
                {users.slice(0, 5).map((account) => (
                  <div key={account.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800">{account.name}</p>
                      <p className="break-all text-sm text-slate-500">{account.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={account.verificationStatus === "approved" ? "default" : "outline"}>
                        {account.verificationStatus}
                      </Badge>
                      <Badge variant={account.role === "admin" ? "default" : "secondary"}>{account.accountType}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>{t.accessCodes}</CardTitle>
              <CardDescription>Generate, deactivate, and monitor code usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" className="justify-start rounded-xl border-slate-200 bg-white">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Generate Resident
                </Button>
                <Button variant="outline" className="justify-start rounded-xl border-slate-200 bg-white">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Generate Captain
                </Button>
                <Button variant="outline" className="justify-start rounded-xl border-slate-200 bg-white">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Generate Kagawad
                </Button>
                <Button variant="outline" className="justify-start rounded-xl border-slate-200 bg-white">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Generate Super Admin
                </Button>
              </div>
              <div className="space-y-3">
                {[...usedCodes, ...sampleUnusedCodes].map((item) => (
                  <div key={`${item.code}-${item.status}`} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800">{item.code}</p>
                      <p className="text-sm text-slate-500">{item.type}</p>
                    </div>
                    <Badge variant={item.status === "used" ? "secondary" : "outline"}>{item.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>{t.snapshot}</CardTitle>
            <CardDescription>Quick look at overall activity while full charts are available in Analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryChip label="Most Reported Issue" value={topIssue} icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} />
              <SummaryChip label="Official Accounts" value={officialUsers.length} icon={<Shield className="h-4 w-4 text-emerald-600" />} />
              <SummaryChip label="Residents" value={residentUsers.length} icon={<Users className="h-4 w-4 text-amber-600" />} />
              <SummaryChip label="Super Admins" value={superAdmins.length || 1} icon={<UserCog className="h-4 w-4 text-cyan-700" />} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_1.15fr_0.9fr]">
        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{t.monitoring}</CardTitle>
                <CardDescription>Review submitted reports, unresolved concerns, and overdue attention points</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", "pending", "in-progress", "resolved"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setReportStatusView(status)}
                    className={
                      reportStatusView === status
                        ? "rounded-full bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white"
                        : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                    }
                  >
                    {status === "all" ? "All" : status}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredMonitoringReports.slice(0, 6).map((report) => (
              <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{report.title}</p>
                    <p className="text-sm text-slate-500">
                      {report.category} | {report.location} | {report.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={report.status === "resolved" ? "default" : report.status === "in-progress" ? "secondary" : "outline"}>
                      {report.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        report.priority === "high"
                          ? "border-red-600 text-red-600"
                          : report.priority === "medium"
                          ? "border-yellow-600 text-yellow-600"
                          : "border-green-600 text-green-600"
                      }
                    >
                      {report.priority}
                    </Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-700">{report.description}</p>
              </div>
            ))}
            {filteredMonitoringReports.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                {t.noReports}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>{t.announcementSystem}</CardTitle>
            <CardDescription>Post updates to all users, residents only, or officials only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {([
                { key: "all", label: "All Users" },
                { key: "residents", label: "Residents" },
                { key: "officials", label: "Officials" },
              ] as const).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setAnnouncementAudience(option.key)}
                  className={
                    announcementAudience === option.key
                      ? "rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                      : "rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Announcement Title</p>
                <Input
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Enter announcement title"
                  className="h-11 rounded-xl border-slate-200 bg-white"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Message</p>
                <Textarea
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Write the announcement message here"
                  className="min-h-28 rounded-xl border-slate-200 bg-white"
                />
              </div>
              <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={handlePostAnnouncement}>
                <Megaphone className="mr-2 h-4 w-4" />
                Post Announcement
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <MiniAction label="Broadcast" value={announcementAudienceCount} hint="Target audience" icon={<Megaphone className="h-4 w-4 text-emerald-600" />} />
              <MiniAction label="Posted Announcements" value={announcements.length} hint="Saved system notices" icon={<Bell className="h-4 w-4 text-cyan-700" />} />
            </div>
            <div className="space-y-3">
              {announcements.slice(0, 4).map((announcement) => (
                <div key={announcement.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium text-slate-900">{announcement.title}</p>
                    <Badge variant="outline" className="w-fit">{announcement.audience}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{announcement.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Posted by {announcement.createdBy} on {announcement.createdAt.toLocaleDateString()}
                  </p>
                </div>
              ))}
              {announcements.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  {t.noAnnouncements}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-white/80 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>{t.incidentEscalation}</CardTitle>
              <CardDescription>Flag urgent items and assign them for immediate attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentReports.slice(0, 4).map((report) => (
                <div key={report.id} className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <p className="font-medium text-rose-900">{report.title}</p>
                  <p className="text-sm text-rose-700">{report.location}</p>
                  <p className="mt-2 text-xs text-rose-700">
                    {report.assignedOfficialName ? `Assigned to ${report.assignedOfficialName}` : "No official assigned yet"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEscalationDialog(report)}
                      className="rounded-full border border-rose-600 px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-100"
                    >
                      High Priority
                    </button>
                    <button
                      type="button"
                      onClick={() => openEscalationDialog(report)}
                      className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-800 transition hover:bg-teal-200"
                    >
                      Assign Official
                    </button>
                  </div>
                </div>
              ))}
              {urgentReports.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No urgent incidents flagged.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>{t.auditLogs}</CardTitle>
              <CardDescription>Track critical actions for transparency and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditLogs.map((log) => (
                <div key={`${log.actor}-${log.time}`} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="font-medium text-slate-800">{log.actor}</p>
                  <p className="text-sm text-slate-600">{log.action}</p>
                  <p className="mt-1 text-xs text-slate-400">{log.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>{t.systemSettings}</CardTitle>
            <CardDescription>Edit barangay information and configure system behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SettingsRow label="Barangay Name" value={systemSettings.barangayName} onClick={openSettingsDialog} />
            <SettingsRow label="Report Categories" value={`${systemSettings.reportCategories.length} active categories`} onClick={openSettingsDialog} />
            <SettingsRow label="Status Types" value={systemSettings.reportStatusTypes.join(", ")} onClick={openSettingsDialog} />
            <SettingsRow
              label="Feature Controls"
              value={
                Object.entries(systemSettings.features)
                  .filter(([, enabled]) => enabled)
                  .map(([label]) => label)
                  .join(", ") || "No features enabled"
              }
              onClick={openSettingsDialog}
            />
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>{t.securityManagement}</CardTitle>
            <CardDescription>Monitor account safety, password resets, and login anomalies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <MiniAction
              label="Failed Login Attempts"
              value={failedLoginCount}
              hint="Open security tools and clear suspicious login triggers"
              icon={<Lock className="h-4 w-4 text-rose-600" />}
              onClick={openSecurityManagement}
            />
            <MiniAction
              label="Locked / Suspicious"
              value={lockedAccountsCount}
              hint="Review accounts that are currently locked"
              icon={<Shield className="h-4 w-4 text-slate-700" />}
              onClick={openSecurityManagement}
            />
            <MiniAction
              label="Password Resets"
              value={passwordResetCandidates}
              hint="Reset passwords and unlock affected accounts"
              icon={<KeyRound className="h-4 w-4 text-cyan-700" />}
              onClick={openSecurityManagement}
            />
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>{t.roleExport}</CardTitle>
            <CardDescription>Manage permissions and generate records for meetings or reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ActionCard
              label="Role Management"
              value="Promote resident, change permissions, assign roles manually"
              icon={<UserCog className="h-4 w-4 text-cyan-700" />}
              onClick={() => navigate("/admin/users")}
            />
            <ActionCard
              label="PDF / Excel Export"
              value="Open export tools for CSV reports, JSON summary, and printable meeting summary"
              icon={<FileSpreadsheet className="h-4 w-4 text-emerald-600" />}
              onClick={() => setExportDialogOpen(true)}
            />
            <ActionCard
              label="Support Monitoring"
              value="Review current support concerns and system follow-up items"
              icon={<LifeBuoy className="h-4 w-4 text-amber-600" />}
              onClick={() => setSupportDialogOpen(true)}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Security Review</DialogTitle>
            <DialogDescription>
              Quick overview of account safety, approvals, and login-related risk indicators.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800">Approved Accounts</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{activeUsers}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">Pending Approvals</p>
              <p className="mt-1 text-2xl font-semibold text-amber-900">{pendingUsers.length}</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-medium text-rose-900">Urgent Reports</p>
              <p className="mt-1 text-2xl font-semibold text-rose-900">{urgentReports.length}</p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="text-sm font-medium text-cyan-900">Audit Activity</p>
              <p className="mt-1 text-sm text-cyan-900">
                Recent actions are being tracked in the dashboard audit logs for transparency.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecurityDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>System Settings</DialogTitle>
            <DialogDescription>
              Update barangay details, report options, and feature controls for the whole system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-800">Barangay Name</p>
              <Input
                value={settingsDraft.barangayName}
                onChange={(event) => setSettingsDraft((current) => ({ ...current, barangayName: event.target.value }))}
                className="h-11 rounded-xl border-slate-200 bg-white"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-800">Report Categories</p>
                <Textarea
                  value={settingsDraft.reportCategories.join(", ")}
                  onChange={(event) =>
                    setSettingsDraft((current) => ({
                      ...current,
                      reportCategories: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                    }))
                  }
                  className="min-h-28 rounded-xl border-slate-200 bg-white"
                />
                <p className="text-xs text-slate-500">Separate categories with commas.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-800">Status Types</p>
                <Textarea
                  value={settingsDraft.reportStatusTypes.join(", ")}
                  onChange={(event) =>
                    setSettingsDraft((current) => ({
                      ...current,
                      reportStatusTypes: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                    }))
                  }
                  className="min-h-28 rounded-xl border-slate-200 bg-white"
                />
                <p className="text-xs text-slate-500">Example: Pending, Ongoing, Resolved, Rejected</p>
              </div>
            </div>
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800">Feature Controls</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Reporting</p>
                    <p className="text-xs text-slate-500">Allow users to submit and manage reports.</p>
                  </div>
                  <Switch
                    checked={settingsDraft.features.reporting}
                    onCheckedChange={(checked) =>
                      setSettingsDraft((current) => ({
                        ...current,
                        features: { ...current.features, reporting: checked },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Announcements</p>
                    <p className="text-xs text-slate-500">Let admins post updates to users.</p>
                  </div>
                  <Switch
                    checked={settingsDraft.features.announcements}
                    onCheckedChange={(checked) =>
                      setSettingsDraft((current) => ({
                        ...current,
                        features: { ...current.features, announcements: checked },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Analytics</p>
                    <p className="text-xs text-slate-500">Keep charts and insight pages available.</p>
                  </div>
                  <Switch
                    checked={settingsDraft.features.analytics}
                    onCheckedChange={(checked) =>
                      setSettingsDraft((current) => ({
                        ...current,
                        features: { ...current.features, analytics: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Close
            </Button>
            <Button className="bg-teal-700 hover:bg-teal-800" onClick={handleSaveSystemSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={securityManagementDialogOpen} onOpenChange={setSecurityManagementDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Security Management</DialogTitle>
            <DialogDescription>
              Review flagged accounts, clear failed attempts, lock or unlock access, and reset passwords.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-rose-700">Failed Attempts</p>
                  <p className="mt-1 text-2xl font-semibold text-rose-900">{failedLoginCount}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">Locked Accounts</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{lockedAccountsCount}</p>
                </div>
                <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-cyan-700">Reset Candidates</p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-900">{passwordResetCandidates}</p>
                </div>
              </div>
              <div className="space-y-2">
                {securityAccounts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No accounts available for security review.
                  </div>
                ) : (
                  securityAccounts.map((account) => {
                    const isLocked = Boolean(account.lockedUntil && new Date(account.lockedUntil).getTime() > Date.now());
                    return (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => setSelectedSecurityAccountId(account.id)}
                        className={
                          selectedSecurityAccountId === account.id
                            ? "w-full rounded-xl border border-teal-300 bg-teal-50 p-3 text-left"
                            : "w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                        }
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{account.name}</p>
                            <p className="text-sm text-slate-500">{account.email}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{account.accountType}</Badge>
                            {isLocked ? <Badge className="bg-rose-600 text-white hover:bg-rose-600">locked</Badge> : null}
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Failed attempts: {account.failedLoginAttempts}</p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {selectedSecurityAccount ? (
                <>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{selectedSecurityAccount.name}</p>
                    <p className="text-sm text-slate-500">{selectedSecurityAccount.email}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Account Type</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{selectedSecurityAccount.accountType}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Failed Attempts</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{selectedSecurityAccount.failedLoginAttempts}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Lock Status</p>
                    <p className="mt-1 text-sm text-slate-900">
                      {selectedSecurityAccount.lockedUntil && new Date(selectedSecurityAccount.lockedUntil).getTime() > Date.now()
                        ? `Locked until ${new Date(selectedSecurityAccount.lockedUntil).toLocaleString()}`
                        : "Account is currently unlocked"}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" onClick={handleClearFailedAttempts}>
                      Clear Attempts
                    </Button>
                    <Button variant="outline" onClick={handleToggleLockState}>
                      {selectedSecurityAccount.lockedUntil && new Date(selectedSecurityAccount.lockedUntil).getTime() > Date.now() ? "Unlock Account" : "Lock Account"}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-800">Reset Password</p>
                    <Input
                      type="password"
                      value={passwordResetValue}
                      onChange={(event) => setPasswordResetValue(event.target.value)}
                      placeholder="Enter a new strong password"
                      className="h-11 rounded-xl border-slate-200 bg-white"
                    />
                    <p className="text-xs text-slate-500">Use at least 8 characters with uppercase, lowercase, and a number.</p>
                    <Button className="w-full bg-teal-700 hover:bg-teal-800" onClick={handlePasswordReset}>
                      Reset Password
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                  Select an account to manage its security settings.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecurityManagementDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={escalationDialogOpen}
        onOpenChange={(open) => {
          setEscalationDialogOpen(open);
          if (!open) {
            setSelectedEscalationReportId(null);
            setSelectedOfficialId("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Incident Escalation</DialogTitle>
            <DialogDescription>
              Review the urgent report, assign an official, and move the case forward.
            </DialogDescription>
          </DialogHeader>
          {selectedEscalationReport ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-rose-900">{selectedEscalationReport.title}</p>
                  <Badge variant="outline" className="border-rose-600 text-rose-600">
                    {selectedEscalationReport.priority} priority
                  </Badge>
                  <Badge variant="secondary">{selectedEscalationReport.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-rose-800">{selectedEscalationReport.description}</p>
                <p className="mt-2 text-xs text-rose-700">
                  Reported by {selectedEscalationReport.userName} at {selectedEscalationReport.location}
                </p>
                <p className="mt-1 text-xs text-rose-700">
                  {selectedEscalationReport.assignedOfficialName
                    ? `Current assignment: ${selectedEscalationReport.assignedOfficialName}`
                    : "Current assignment: none"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-800">Assign to official</p>
                <Select value={selectedOfficialId} onValueChange={setSelectedOfficialId}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                    <SelectValue placeholder="Choose an official" />
                  </SelectTrigger>
                  <SelectContent>
                    {officialUsers.map((official) => (
                      <SelectItem key={official.id} value={official.id}>
                        {official.name}{official.position ? ` - ${official.position}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <Button variant="outline" className="rounded-xl" onClick={() => handleEscalationStatusChange("pending")}>
                  Mark Pending
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => handleEscalationStatusChange("in-progress")}>
                  Mark In Progress
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => handleEscalationStatusChange("resolved")}>
                  Mark Resolved
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Select an urgent report to review.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalationDialogOpen(false)}>
              Close
            </Button>
            <Button className="bg-teal-700 hover:bg-teal-800" onClick={handleAssignOfficial} disabled={!selectedEscalationReport}>
              Save Escalation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Tools</DialogTitle>
            <DialogDescription>Download records for meetings, presentations, and system reporting.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Button variant="outline" className="justify-start" onClick={handleExportSummary}>
              <Download className="mr-2 h-4 w-4" />
              Export Summary JSON
            </Button>
            <Button variant="outline" className="justify-start" onClick={handleExportReportsCsv}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Reports CSV
            </Button>
            <Button variant="outline" className="justify-start" onClick={handleGenerateMeetingSummary}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Printable Meeting Summary
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Support Monitoring</DialogTitle>
            <DialogDescription>Review current user-facing concerns and operational follow-up items.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">Pending Registrations</p>
              <p className="mt-1 text-sm text-amber-900">{pendingUsers.length} account(s) may need review or follow-up.</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-medium text-rose-900">Urgent Concerns</p>
              <p className="mt-1 text-sm text-rose-900">{urgentReports.length} high-priority report(s) need close monitoring.</p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="text-sm font-medium text-cyan-900">Announcements Posted</p>
              <p className="mt-1 text-sm text-cyan-900">{announcements.length} announcement(s) are active in the system.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800">Recommended Next Step</p>
              <p className="mt-1 text-sm text-slate-600">Use User Management for account actions, Analytics for report trends, and Announcements for broadcast updates.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupportDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-white/80 bg-white/90 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function MiniAction({
  label,
  value,
  hint,
  icon,
  onClick,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  const classes = "rounded-2xl border border-slate-200 bg-white px-4 py-3";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${classes} w-full text-left transition hover:border-slate-300 hover:bg-slate-50`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">{label}</p>
          {icon}
        </div>
        <p className="mt-2 text-2xl font-semibold leading-tight text-slate-900 break-words">{value}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
      </button>
    );
  }

  return (
    <div className={classes}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold leading-tight text-slate-900 break-words">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
    </div>
  );
}

function SettingsRow({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
      >
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{value}</p>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{value}</p>
    </div>
  );
}

function SummaryChip({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="flex min-w-[180px] flex-1 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-1 truncate text-lg font-semibold text-slate-900">{value}</p>
      </div>
      <div className="ml-3 shrink-0">{icon}</div>
    </div>
  );
}

function ActionCard({
  label,
  value,
  icon,
  onClick,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {icon}
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-500">{value}</p>
    </button>
  );
}
