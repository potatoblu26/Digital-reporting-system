import { AppShell } from "../components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useAppLanguage } from "../lib/appLanguage";
import { getAnnouncementsForCurrentUser, getCurrentUser, getReports } from "../lib/mockData";

export default function UserDashboard() {
  const user = getCurrentUser();
  const { language } = useAppLanguage();
  const t = language === "tl"
    ? {
        title: `Welcome back, ${user?.name}!`,
        description: "I-check ang reports mo at magsumite ng bagong concern",
        totalReports: "Kabuuang Report",
        pending: "Pending",
        inProgress: "Inaasikaso",
        resolved: "Resolved",
        announcements: "Announcements",
        updates: "Mga update para sa'yo",
        noAnnouncements: "Wala pang announcements.",
        postedBy: "Posted ni",
        on: "noong",
        recentReports: "Recent Reports",
        latestReports: "Pinakahuling reports mo",
        noReports: "Wala ka pang report. Mag-submit ng una mong report.",
        submitted: "Naipasa",
      }
    : {
        title: `Welcome back, ${user?.name}!`,
        description: "Track your reports and submit new concerns",
        totalReports: "Total Reports",
        pending: "Pending",
        inProgress: "In Progress",
        resolved: "Resolved",
        announcements: "Announcements",
        updates: "Updates posted for you",
        noAnnouncements: "No announcements yet.",
        postedBy: "Posted by",
        on: "on",
        recentReports: "Recent Reports",
        latestReports: "Your latest submitted reports",
        noReports: "No reports yet. Submit your first report to get started!",
        submitted: "Submitted",
      };

  if (!user) return null;

  const userReports = getReports().filter((r) => r.userId === user.id);
  const announcements = getAnnouncementsForCurrentUser();
  const pendingCount = userReports.filter((r) => r.status === "pending").length;
  const inProgressCount = userReports.filter((r) => r.status === "in-progress").length;
  const resolvedCount = userReports.filter((r) => r.status === "resolved").length;
  const recentReports = userReports.slice(0, 3);

  return (
    <AppShell title={t.title} description={t.description}>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.totalReports}</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{userReports.length}</div>
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.pending}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.inProgress}</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{inProgressCount}</div>
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.resolved}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/80 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>{t.announcements}</CardTitle>
          <CardDescription>{t.updates}</CardDescription>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p>{t.noAnnouncements}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.slice(0, 3).map((announcement) => (
                <div key={announcement.id} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-medium">{announcement.title}</h3>
                      <p className="text-sm text-slate-600">{announcement.message}</p>
                    </div>
                    <Badge variant="outline">{announcement.audience}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {t.postedBy} {announcement.createdBy} {t.on} {announcement.createdAt.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 border-white/80 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>{t.recentReports}</CardTitle>
          <CardDescription>{t.latestReports}</CardDescription>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <FileText className="mx-auto mb-2 h-12 w-12 text-slate-400" />
              <p>{t.noReports}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-slate-600">{report.category} | {report.location}</p>
                    </div>
                    <Badge
                      variant={
                        report.status === "resolved"
                          ? "default"
                          : report.status === "in-progress"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {report.status}
                    </Badge>
                  </div>
                  <p className="mb-2 text-sm text-slate-600">{report.description}</p>
                  <p className="text-xs text-slate-500">{t.submitted} {report.createdAt.toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
