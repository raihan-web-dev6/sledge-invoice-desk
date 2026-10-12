
"use client";

import { CheckCheck, ChevronDown, CircleHelp, Command } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
          <CheckCheck size={22} strokeWidth={2.2} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Sledge
            </h2>
            <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Workspace
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Invoice approval desk
          </p>
        </div>
      </div>

      <nav
        aria-label="Workspace navigation"
        className="flex flex-wrap items-center gap-2 sm:gap-3"
      >
        <div className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-slate-700">
          <Command size={16} />
          <span>Invoice workspace</span>
        </div>

        <a
          href="mailto:support@example.com?subject=Sledge%20Invoice%20Desk"
          className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
        >
          <CircleHelp size={17} />
          <span>Help</span>
        </a>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            SD
          </span>
          <span>Reviewer</span>
          <ChevronDown size={15} className="text-slate-400" />
        </div>
      </nav>
    </header>
  );
}
