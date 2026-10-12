"use client";

import { Clock3, FileCheck2, ShieldAlert } from "lucide-react";

export type InvoiceTab = "processing" | "needs_review" | "decisions";

interface InvoiceTabsProps {
  activeTab: InvoiceTab;
  onTabChange: (tab: InvoiceTab) => void;
  counts: {
    processing: number;
    needs_review: number;
    decisions: number;
  };
}

const tabs: {
  id: InvoiceTab;
  label: string;
  icon: typeof Clock3;
}[] = [
  { id: "processing", label: "Processing", icon: Clock3 },
  { id: "needs_review", label: "Needs review", icon: ShieldAlert },
  { id: "decisions", label: "Approved / Rejected", icon: FileCheck2 },
];

export default function InvoiceTabs({
  activeTab,
  onTabChange,
  counts,
}: InvoiceTabsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto border-b border-slate-200"
      role="tablist"
      aria-label="Filter invoices by status"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-medium transition ${
              active
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
            }`}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}