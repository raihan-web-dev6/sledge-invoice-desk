"use client";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Mail,
  X,
  XCircle,
} from "lucide-react";
import type { IInvoice } from "@/types/invoice";
import { formatCurrency, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/status-badge";

interface InvoiceDetailsProps {
  invoice: IInvoice | null;
  onClose: () => void;
  onApprove: (invoice: IInvoice) => void;
  onReject: (invoice: IInvoice) => void;
  isUpdating?: boolean;
}

export default function InvoiceDetails({
  invoice,
  onClose,
  onApprove,
  onReject,
  isUpdating = false,
}: InvoiceDetailsProps) {
  if (!invoice) return null;

  const hasDecision =
    invoice.status === "approved" || invoice.status === "rejected";

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-950/30"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isUpdating) {
          onClose();
        }
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-details-title"
        className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Invoice details
            </p>
            <h2
              id="invoice-details-title"
              className="mt-2 text-xl font-semibold tracking-tight text-slate-900"
            >
              {invoice.invoiceNumber}
            </h2>
            <div className="mt-3">
              <StatusBadge status={invoice.status} />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            aria-label="Close invoice details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 p-5 sm:p-7">
          {invoice.isDuplicate && (
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0 text-amber-700"
              />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Potential duplicate invoice
                </p>
                <p className="mt-1 text-sm leading-5 text-amber-800">
                  This invoice has been flagged as a possible duplicate. Check
                  the vendor, invoice number, and amount before making a
                  decision.
                </p>
                {invoice.duplicateOf && (
                  <p className="mt-2 text-xs text-amber-800">
                    Original invoice ID: {invoice.duplicateOf}
                  </p>
                )}
              </div>
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-500">Invoice amount</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(invoice.amount, invoice.currency)}
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <CalendarDays
                  size={17}
                  className="mt-0.5 shrink-0 text-slate-400"
                />
                <div>
                  <p className="text-xs text-slate-500">Invoice date</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(invoice.invoiceDate)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock3
                  size={17}
                  className="mt-0.5 shrink-0 text-slate-400"
                />
                <div>
                  <p className="text-xs text-slate-500">Due date</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900">
              Vendor information
            </h3>
            <div className="mt-3 rounded-xl border border-slate-200 p-4">
              <p className="font-medium text-slate-800">
                {invoice.vendorName}
              </p>
              {invoice.vendorEmail && (
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Mail size={15} />
                  {invoice.vendorEmail}
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900">
              Invoice description
            </h3>
            <div className="mt-3 flex gap-3 rounded-xl border border-slate-200 p-4">
              <FileText
                size={18}
                className="mt-0.5 shrink-0 text-slate-400"
              />
              <p className="text-sm leading-6 text-slate-600">
                {invoice.description}
              </p>
            </div>
          </section>

          <section className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Record information</p>
            <p className="mt-2 break-all text-xs text-slate-600">
              Invoice ID: {invoice._id}
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Created: {formatDate(invoice.createdAt)}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Last updated: {formatDate(invoice.updatedAt)}
            </p>
          </section>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-5 sm:px-7">
          {hasDecision ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              {invoice.status === "approved" ? (
                <CheckCircle2 size={18} className="text-emerald-600" />
              ) : (
                <XCircle size={18} className="text-rose-600" />
              )}
              This invoice has already been {invoice.status}.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onReject(invoice)}
                disabled={isUpdating}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                <XCircle size={17} />
                Reject
              </button>
              <button
                type="button"
                onClick={() => onApprove(invoice)}
                disabled={isUpdating}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <CheckCircle2 size={17} />
                Approve
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}