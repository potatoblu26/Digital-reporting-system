import { useEffect, useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { initializeAppData, subscribeToAuthChanges } from "./lib/mockData";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const boot = async () => {
      await initializeAppData();
      if (active) setReady(true);
    };

    boot();

    const unsubscribe = subscribeToAuthChanges(() => {
      if (active) setReady((value) => value || true);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-2xl border border-white/80 bg-white/90 px-6 py-5 text-sm text-slate-600 shadow-sm">
          Loading system...
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
