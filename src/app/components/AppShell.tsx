import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface AppShellProps {
  title: string;
  description: string;
  children: ReactNode;
  headerActions?: ReactNode;
  maxWidthClassName?: string;
}

export function AppShell({
  title,
  description,
  children,
  headerActions,
  maxWidthClassName = "",
}: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      <div className="pointer-events-none absolute -left-24 top-20 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl float-slow" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl float-slow [animation-delay:1000ms]" />
      <Navbar />
      <main className={`container relative z-10 mx-auto px-3 py-4 pb-24 sm:px-4 sm:py-6 md:px-6 md:py-8 md:pb-8 ${maxWidthClassName}`}>
        <header className="mb-6 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-sm fade-up sm:p-5 md:mb-8 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h1 className="mb-1 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">{title}</h1>
              <p className="text-sm text-slate-600 sm:text-base">{description}</p>
            </div>
            {headerActions ? <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">{headerActions}</div> : null}
          </div>
        </header>
        <div className="fade-up [animation-delay:120ms]">
          {children}
        </div>
      </main>
    </div>
  );
}
