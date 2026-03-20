import { Navigate } from "react-router";
import { getCurrentUser, getDashboardPath } from "../lib/mockData";

export default function DashboardRedirect() {
  const user = getCurrentUser();

  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={getDashboardPath(user)} replace />;
}
