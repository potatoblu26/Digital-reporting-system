import { Navigate, Outlet } from "react-router";
import { getCurrentUser, getDashboardPath } from "../lib/mockData";
import { useAppDataRefresh } from "../lib/useAppDataRefresh";

export function UserRoute() {
  useAppDataRefresh();
  const user = getCurrentUser();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "user") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  useAppDataRefresh();
  const user = getCurrentUser();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function AuthRoute() {
  useAppDataRefresh();
  const user = getCurrentUser();
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}
