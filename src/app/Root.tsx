import { Outlet, useLocation } from "react-router";
import { Toaster } from "./components/ui/sonner";

export default function Root() {
  const location = useLocation();

  return (
    <>
      <div key={location.pathname} className="route-transition">
        <Outlet />
      </div>
      <Toaster />
    </>
  );
}
