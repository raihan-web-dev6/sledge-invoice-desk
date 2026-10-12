
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  RefreshCw,
  Files,
  FileClock,
  FileCheck2,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import DashboardHeader from "@/components/dashboard-header";
import SummaryCards from "@/components/summary-cards";
import InvoiceTabs, { type InvoiceTab } from "@/components/invoice-tabs";
import { Plus } from "lucide-react";
import AddInvoiceDialog from "@/components/add-invoice-dialog";
import InvoiceTable from "@/components/invoice-table";
import InvoiceDetails from "@/components/invoice-details";
import ConfirmDialog, {
  type DecisionAction,
} from "@/components/confirm-dialog";

import type { IInvoice, InvoiceApiResponse } from "@/types/invoice";

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [activeTab, setActiveTab] = useState<InvoiceTab>("needs_review");
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null);
  const [confirmAction, setConfirmAction] = useState<DecisionAction | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/invoices", {
        cache: "no-store",
      });
      const data: InvoiceApiResponse = await response.json();

      if (!response.ok || !data.success || !data.invoices) {
        throw new Error(data.error || "Could not load invoices.");
      }

      setInvoices(data.invoices);

      setSelectedInvoice((current) => {
        if (!current) return null;
        return data.invoices!.find((item) => item._id === current._id) ?? null;
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong loading invoices.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  const counts = useMemo(
    () => ({
      processing: invoices.filter((invoice) => invoice.status === "processing")
        .length,
      needs_review: invoices.filter(
        (invoice) => invoice.status === "needs_review",
      ).length,
      decisions: invoices.filter(
        (invoice) =>
          invoice.status === "approved" || invoice.status === "rejected",
      ).length,
    }),
    [invoices],
  );

  const visibleInvoices = useMemo(() => {
    if (activeTab === "decisions") {
      return invoices.filter(
        (invoice) =>
          invoice.status === "approved" || invoice.status === "rejected",
      );
    }

    return invoices.filter((invoice) => invoice.status === activeTab);
  }, [activeTab, invoices]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Total invoices",
        value: invoices.length,
        note: "Invoices in the workspace",
        icon: Files,
        iconClass: "bg-blue-50 text-blue-700",
      },
      {
        label: "Processing",
        value: counts.processing,
        note: "Currently being processed",
        icon: FileClock,
        iconClass: "bg-violet-50 text-violet-700",
      },
      {
        label: "Needs review",
        value: counts.needs_review,
        note: "Require your attention",
        icon: ShieldAlert,
        iconClass: "bg-amber-50 text-amber-700",
      },
      {
        label: "Approved",
        value: invoices.filter((invoice) => invoice.status === "approved")
          .length,
        note: "Successfully approved",
        icon: FileCheck2,
        iconClass: "bg-emerald-50 text-emerald-700",
      },
    ],
    [counts, invoices],
  );

  function startDecision(
    invoice: IInvoice,
    action: DecisionAction,
  ) {
    setSelectedInvoice(invoice);
    setConfirmAction(action);
    setNotice("");
  }

  async function confirmDecision() {
    if (!selectedInvoice || !confirmAction || updating) return;

    setUpdating(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/invoices/${selectedInvoice._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: confirmAction }),
        },
      );

      const data: InvoiceApiResponse = await response.json();

      if (!response.ok || !data.success || !data.invoice) {
        throw new Error(data.error || "Could not update invoice status.");
      }

      setInvoices((current) =>
        current.map((invoice) =>
          invoice._id === data.invoice!._id ? data.invoice! : invoice,
        ),
      );

      setSelectedInvoice(data.invoice);
      setNotice(
        `${data.invoice.invoiceNumber} was ${confirmAction} successfully.`,
      );
      setConfirmAction(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update invoice status.",
      );
    } finally {
      setUpdating(false);
    }
  }

  function exportInvoices() {
    const headers = [
      "Invoice Number",
      "Vendor",
      "Amount",
      "Currency",
      "Invoice Date",
      "Due Date",
      "Status",
      "Potential Duplicate",
    ];

    const rows = invoices.map((invoice) => [
      invoice.invoiceNumber,
      invoice.vendorName,
      invoice.amount,
      invoice.currency,
      invoice.invoiceDate,
      invoice.dueDate,
      invoice.status,
      invoice.isDuplicate ? "Yes" : "No",
    ]);

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sledge-invoices.csv";
    link.click();

    URL.revokeObjectURL(url);
  }
  function handleInvoiceCreated(invoice: IInvoice) {
  setInvoices((current) => [invoice, ...current]);
  setActiveTab("needs_review");
  setSelectedInvoice(null);
  setError("");
  setNotice(`${invoice.invoiceNumber} was created successfully.`);
}

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        <DashboardHeader />

        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Invoice management workspace
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Invoice overview
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Review invoices, investigate potential duplicates, and record
                approval decisions in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void fetchInvoices()}
                disabled={loading}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={exportInvoices}
                disabled={loading || invoices.length === 0}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                <ArrowDownToLine size={16} />
                Export CSV
              </button>

              <button
  type="button"
  onClick={() => setShowAddInvoice(true)}
  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
>
  <Plus size={16} />
  Add Invoice
</button>
            </div>
          </div>

          

          <div className="mt-7">
            <SummaryCards cards={summaryCards} />
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-rose-600"
              />
              <p className="text-sm leading-6 text-rose-800">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void fetchInvoices()}
              className="self-start text-sm font-semibold text-rose-700 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
          >
            <CheckCircle2 size={19} className="shrink-0 text-emerald-700" />
            <p className="text-sm text-emerald-800">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="ml-auto text-sm font-medium text-emerald-800"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="text-base font-semibold text-slate-900">
              Invoice register
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select an invoice to inspect its details or record a decision.
            </p>
          </div>

          <InvoiceTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />

          <InvoiceTable
            invoices={visibleInvoices}
            loading={loading}
            selectedInvoiceId={selectedInvoice?._id}
            onSelect={setSelectedInvoice}
          />

          <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-xs text-slate-500">
              Showing {visibleInvoices.length} invoice
              {visibleInvoices.length === 1 ? "" : "s"} in this category.
            </p>
          </div>
        </section>

        <footer className="flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Sledge Invoice Desk</p>
          <p>Invoice data is loaded from your configured MongoDB database.</p>
        </footer>
      </div>

      <InvoiceDetails
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onApprove={(invoice) => startDecision(invoice, "approved")}
        onReject={(invoice) => startDecision(invoice, "rejected")}
        isUpdating={updating}
      />

      <ConfirmDialog
        open={confirmAction !== null}
        action={confirmAction ?? "approved"}
        invoiceNumber={selectedInvoice?.invoiceNumber ?? ""}
        isSubmitting={updating}
        onCancel={() => {
          if (!updating) setConfirmAction(null);
        }}
        onConfirm={() => void confirmDecision()}
      />

      <AddInvoiceDialog
  open={showAddInvoice}
  onClose={() => setShowAddInvoice(false)}
  onCreated={handleInvoiceCreated}
/>
    </main>
  );
}
