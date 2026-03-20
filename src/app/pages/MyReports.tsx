import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { FileText, Search } from "lucide-react";
import { useAppLanguage } from "../lib/appLanguage";
import { getCurrentUser, getReports } from "../lib/mockData";

export default function MyReports() {
  const user = getCurrentUser();
  const { language } = useAppLanguage();
  const t = language === "tl"
    ? {
        title: "Aking Reports",
        description: "Tingnan at i-track ang lahat ng report na naipasa mo",
        searchPlaceholder: "Maghanap ng report...",
        allStatus: "Lahat ng Status",
        pending: "Pending",
        inProgress: "In Progress",
        resolved: "Resolved",
        rejected: "Rejected",
        noReports: "Walang nahanap na report",
        priority: "Priority",
        submitted: "Naipasa",
        updated: "Na-update",
      }
    : {
        title: "My Reports",
        description: "View and track all your submitted reports",
        searchPlaceholder: "Search reports...",
        allStatus: "All Status",
        pending: "Pending",
        inProgress: "In Progress",
        resolved: "Resolved",
        rejected: "Rejected",
        noReports: "No reports found",
        priority: "Priority",
        submitted: "Submitted",
        updated: "Updated",
      };
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  if (!user) return null;

  const userReports = getReports().filter((r) => r.userId === user.id);

  const filteredReports = userReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <AppShell title={t.title} description={t.description}>
      <Card className="mb-6 border-white/80 bg-white/90 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white pl-10"
              />
            </div>
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-1">{report.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span>{report.category}</span>
                      <span>|</span>
                      <span>{report.location}</span>
                      <span>|</span>
                      <span className={getPriorityColor(report.priority)}>
                        {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} {t.priority}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-slate-700">{report.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{t.submitted}: {report.createdAt.toLocaleDateString()}</span>
                  <span>|</span>
                  <span>{t.updated}: {report.updatedAt.toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
