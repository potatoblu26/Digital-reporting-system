import { Navigate, Outlet } from "react-router";
import { getCurrentUser, getDashboardPath } from "../lib/mockData";

export function UserRoute() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "user") return <Navigate to={getDashboardPath(user)} replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to={getDashboardPath(user)} replace />;
  return <Outlet />;
}

export function AuthRoute() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}
