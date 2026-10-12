"use client";

import { ArrowUpRight, Files, Search } from "lucide-react";
import type { IInvoice } from "@/types/invoice";
import { formatCurrency, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/status-badge";

interface InvoiceTableProps {
  invoices: IInvoice[];
  onSelect: (invoice: IInvoice) => void;
  selectedInvoiceId?: string;
  loading?: boolean;
}

export default function InvoiceTable({
  invoices,
  onSelect,
  selectedInvoiceId,
  loading = false,
}: InvoiceTableProps) {
  if (loading) {
    return (
      <div className="space-y-3 p-5" aria-label="Loading invoices">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-lg bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Files size={23} />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          No invoices found
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          There are no invoices in this category right now. Try another tab or
          check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left">
        <thead className="bg-slate-50/80">
          <tr className="text-xs font-medium uppercase tracking-wide text-slate-500">
            <th scope="col" className="px-5 py-4 sm:px-6">
              Invoice
            </th>
            <th scope="col" className="px-5 py-4">
              Vendor
            </th>
            <th scope="col" className="px-5 py-4">
              Invoice date
            </th>
            <th scope="col" className="px-5 py-4">
              Amount
            </th>
            <th scope="col" className="px-5 py-4">
              Status
            </th>
            <th scope="col" className="px-5 py-4">
              <span className="sr-only">Open invoice</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {invoices.map((invoice) => {
            const selected = selectedInvoiceId === invoice._id;

            return (
              <tr
                key={invoice._id}
                className={`transition hover:bg-slate-50 ${
                  selected ? "bg-blue-50/60" : ""
                }`}
              >
                <td className="px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => onSelect(invoice)}
                    className="text-left"
                    aria-label={`View invoice ${invoice.invoiceNumber}`}
                  >
                    <span className="text-sm font-semibold text-slate-800 hover:text-blue-700">
                      {invoice.invoiceNumber}
                    </span>
                    <span className="mt-1 block max-w-[220px] truncate text-xs text-slate-500">
                      {invoice.description}
                    </span>
                  </button>
                  {invoice.isDuplicate && (
                    <span className="mt-2 inline-flex rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                      Potential duplicate
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <span className="text-sm font-medium text-slate-700">
                    {invoice.vendorName}
                  </span>
                  {invoice.vendorEmail && (
                    <span className="mt-1 block text-xs text-slate-500">
                      {invoice.vendorEmail}
                    </span>
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {formatDate(invoice.invoiceDate)}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold tabular-nums text-slate-800">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={invoice.status} />
                </td>

                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onSelect(invoice)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-blue-700"
                    aria-label={`Open details for ${invoice.invoiceNumber}`}
                  >
                    <ArrowUpRight size={17} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}