import { Navigate } from "react-router";
import { getCurrentUser, getDashboardPath } from "../lib/mockData";
import { useAppDataRefresh } from "../lib/useAppDataRefresh";

export default function DashboardRedirect() {
  useAppDataRefresh();
  const user = getCurrentUser();

  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={getDashboardPath(user)} replace />;
}
