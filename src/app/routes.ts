import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SubmitReport from "./pages/SubmitReport";
import MyReports from "./pages/MyReports";
import AllReports from "./pages/AllReports";
import UserManagement from "./pages/UserManagement";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import DashboardRedirect from "./pages/DashboardRedirect";
import { AdminRoute, AuthRoute, UserRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      {
        Component: AuthRoute,
        children: [
          { path: "profile", Component: Profile },
          { path: "dashboard", Component: DashboardRedirect },
        ],
      },
      {
        Component: UserRoute,
        children: [
          { path: "user/dashboard", Component: UserDashboard },
          { path: "user/submit-report", Component: SubmitReport },
          { path: "user/my-reports", Component: MyReports },
        ],
      },
      {
        Component: AdminRoute,
        children: [
          { path: "admin/dashboard", Component: AdminDashboard },
          { path: "admin/reports", Component: AllReports },
          { path: "admin/users", Component: UserManagement },
          { path: "admin/analytics", Component: Analytics },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
