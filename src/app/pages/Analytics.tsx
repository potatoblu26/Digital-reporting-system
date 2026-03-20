import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { AppShell } from "../components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAppLanguage } from "../lib/appLanguage";
import { getCurrentUser, getReports, getUsers } from "../lib/mockData";
import { useAppDataRefresh } from "../lib/useAppDataRefresh";

const chartColors = ["#0f766e", "#06b6d4", "#0ea5e9", "#10b981", "#f59e0b", "#64748b"];
const reportCategories = ["Infrastructure", "Sanitation", "Public Safety", "Utilities", "Health", "Environment", "Other"];

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString(undefined, {
    month: "short",
  });

export default function Analytics() {
  useAppDataRefresh();
  const user = getCurrentUser();
  const { language } = useAppLanguage();
  const t = language === "tl"
    ? {
        title: "Analytics",
        description: "Mga insight at visuals para sa dami ng reports, trends, at category distribution",
        analyticsTitle: "Analytics at Dashboard Insights",
        analyticsDesc: "Malinaw na visual overview ng report volume, trends, at category distribution",
        trends: "Monthly / Weekly Trends",
        category: "Reports per Category",
        statusBreakdown: "Status Breakdown",
        topIssue: "Pinaka-Madalas na Issue",
        officialAccounts: "Official Accounts",
        residents: "Residents",
        activeUsers: "Active Users",
        noData: "Wala pang data",
        pending: "Pending",
        ongoing: "Ongoing",
        resolved: "Resolved",
        rejected: "Rejected",
      }
    : {
        title: "Analytics",
        description: "Insights and dashboard visuals for report volume, trends, and category distribution",
        analyticsTitle: "Analytics & Dashboard Insights",
        analyticsDesc: "Defense-ready visual overview of report volume, trends, and category distribution",
        trends: "Monthly / Weekly Trends",
        category: "Reports per Category",
        statusBreakdown: "Status Breakdown",
        topIssue: "Most Reported Issue",
        officialAccounts: "Official Accounts",
        residents: "Residents",
        activeUsers: "Active Users",
        noData: "No data yet",
        pending: "Pending",
        ongoing: "Ongoing",
        resolved: "Resolved",
        rejected: "Rejected",
      };

  if (!user) return null;

  const reports = getReports();
  const users = getUsers();

  const pendingReports = reports.filter((r) => r.status === "pending").length;
  const inProgressReports = reports.filter((r) => r.status === "in-progress").length;
  const resolvedReports = reports.filter((r) => r.status === "resolved").length;
  const activeUsers = users.filter((u) => u.verificationStatus === "approved").length;
  const officialUsers = users.filter((u) => u.accountType === "official").length;
  const residentUsers = users.filter((u) => u.accountType === "resident").length;

  const statusData = [
    { name: t.pending, value: pendingReports, color: "#f59e0b" },
    { name: t.ongoing, value: inProgressReports, color: "#06b6d4" },
    { name: t.resolved, value: resolvedReports, color: "#10b981" },
    { name: t.rejected, value: reports.filter((r) => r.status === "rejected").length, color: "#334155" },
  ];

  const categoryData = reportCategories.map((category, index) => ({
    name: category,
    count: reports.filter((report) => report.category === category).length,
    color: chartColors[index % chartColors.length],
  }));

  const topIssue =
    [...categoryData].sort((a, b) => b.count - a.count)[0]?.name ?? t.noData;

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

  return (
    <AppShell title={t.title} description={t.description}>
      <Card className="border-white/80 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>{t.analyticsTitle}</CardTitle>
          <CardDescription>{t.analyticsDesc}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">{t.trends}</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reports" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="resolved" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">{t.category}</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">{t.statusBreakdown}</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={86}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-4">
            <InsightPill label={t.topIssue} value={topIssue} tone="cyan" />
            <InsightPill label={t.officialAccounts} value={officialUsers} tone="emerald" />
            <InsightPill label={t.residents} value={residentUsers} tone="amber" />
            <InsightPill label={t.activeUsers} value={activeUsers} tone="slate" />
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function InsightPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "cyan" | "emerald" | "amber" | "slate";
}) {
  const toneClass =
    tone === "cyan"
      ? "border-cyan-200 bg-cyan-50"
      : tone === "emerald"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50"
      : "border-slate-200 bg-slate-50";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
