import { Link, NavLink, useNavigate } from "react-router";
import { Button } from "./ui/button";
import {
  FileText,
  LogOut,
  LayoutDashboard,
  Users,
  BarChart3,
  PlusCircle,
  FileCheck,
  UserCircle2,
} from "lucide-react";
import { getCurrentUser, getDashboardPath, getRoleLabel, logout } from "../lib/mockData";
import { useAppLanguage } from "../lib/appLanguage";
import { useAppDataRefresh } from "../lib/useAppDataRefresh";
import { toast } from "sonner";
import { cn } from "./ui/utils";

export function Navbar() {
  useAppDataRefresh();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { language, setLanguage } = useAppLanguage();
  const t = language === "tl"
    ? {
        profile: "Profile",
        logout: "Logout",
        dashboard: "Dashboard",
        reports: "Reports",
        users: "Users",
        stats: "Stats",
        submit: "Submit",
        home: "Home",
        me: "Ako",
        out: "Labas",
        english: "English",
        tagalog: "Tagalog",
      }
    : {
        profile: "Profile",
        logout: "Logout",
        dashboard: "Dashboard",
        reports: "Reports",
        users: "Users",
        stats: "Stats",
        submit: "Submit",
        home: "Home",
        me: "Me",
        out: "Out",
        english: "English",
        tagalog: "Tagalog",
      };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const navButtonClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
      isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-slate-700 hover:bg-slate-100",
    );
  const mobileTabClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition",
      isActive ? "bg-primary text-primary-foreground" : "text-slate-600 hover:bg-slate-100",
    );

  return (
    <nav className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Link
              to={getDashboardPath(user)}
              className="flex min-w-0 w-fit items-center gap-2.5 rounded-lg px-1 py-1"
            >
              <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 p-2">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="line-clamp-2 text-base font-semibold tracking-tight sm:text-lg">E-Report Barangay System</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="rounded-full border border-slate-200 bg-white p-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold transition sm:px-3",
                      language === "en" ? "bg-slate-900 text-white" : "text-slate-600",
                    )}
                  >
                    {t.english}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("tl")}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold transition sm:px-3",
                      language === "tl" ? "bg-slate-900 text-white" : "text-slate-600",
                    )}
                  >
                    {t.tagalog}
                  </button>
                </div>
              </div>
              <div className="hidden text-right text-sm sm:block">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-slate-500">{getRoleLabel(user)}</div>
              </div>
              <Link to="/profile">
                <Button variant="outline" size="sm" className="rounded-lg border-slate-200 bg-white px-3">
                  <UserCircle2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t.profile}</span>
                  <span className="sm:hidden">{t.me}</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="rounded-lg border-slate-200 bg-white px-3" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t.logout}</span>
                <span className="sm:hidden">{t.out}</span>
              </Button>
            </div>
          </div>

          <div className="mt-3 hidden flex-wrap items-center gap-1 border-t border-slate-200/80 pt-3 md:flex">
            {isAdmin ? (
              <>
                <NavLink to="/admin/dashboard" className={navButtonClass}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t.dashboard}
                </NavLink>
                <NavLink to="/admin/reports" className={navButtonClass}>
                    <FileText className="h-4 w-4 mr-2" />
                    {language === "tl" ? "Lahat ng Report" : "All Reports"}
                </NavLink>
                <NavLink to="/admin/users" className={navButtonClass}>
                    <Users className="h-4 w-4 mr-2" />
                    {t.users}
                </NavLink>
                <NavLink to="/admin/analytics" className={navButtonClass}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {language === "tl" ? "Analytics" : "Analytics"}
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/user/dashboard" className={navButtonClass}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t.dashboard}
                </NavLink>
                <NavLink to="/user/submit-report" className={navButtonClass}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {language === "tl" ? "Mag-Report" : "Submit Report"}
                </NavLink>
                <NavLink to="/user/my-reports" className={navButtonClass}>
                    <FileCheck className="h-4 w-4 mr-2" />
                    {language === "tl" ? "Aking Reports" : "My Reports"}
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/90 bg-white/95 p-2 backdrop-blur md:hidden">
        <div className="mx-auto flex w-full max-w-md items-center gap-1">
          {isAdmin ? (
            <>
              <NavLink to="/admin/dashboard" className={mobileTabClass}>
                <LayoutDashboard className="h-4 w-4" />
                <span>{t.dashboard}</span>
              </NavLink>
              <NavLink to="/admin/reports" className={mobileTabClass}>
                <FileText className="h-4 w-4" />
                <span>{t.reports}</span>
              </NavLink>
              <NavLink to="/admin/users" className={mobileTabClass}>
                <Users className="h-4 w-4" />
                <span>{t.users}</span>
              </NavLink>
              <NavLink to="/admin/analytics" className={mobileTabClass}>
                <BarChart3 className="h-4 w-4" />
                <span>{t.stats}</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/user/dashboard" className={mobileTabClass}>
                <LayoutDashboard className="h-4 w-4" />
                <span>{t.home}</span>
              </NavLink>
              <NavLink to="/user/submit-report" className={mobileTabClass}>
                <PlusCircle className="h-4 w-4" />
                <span>{t.submit}</span>
              </NavLink>
              <NavLink to="/user/my-reports" className={mobileTabClass}>
                <FileCheck className="h-4 w-4" />
                <span>{t.reports}</span>
              </NavLink>
              <NavLink to="/profile" className={mobileTabClass}>
                <UserCircle2 className="h-4 w-4" />
                <span>{t.profile}</span>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
