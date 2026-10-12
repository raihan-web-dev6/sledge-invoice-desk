
"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, LoaderCircle, X } from "lucide-react";
import type { IInvoice, InvoiceApiResponse } from "@/types/invoice";

interface AddInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (invoice: IInvoice) => void;
}

interface InvoiceFormValues {
  invoiceNumber: string;
  vendorName: string;
  vendorEmail: string;
  amount: string;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  description: string;
}

const initialValues: InvoiceFormValues = {
  invoiceNumber: "",
  vendorName: "",
  vendorEmail: "",
  amount: "",
  currency: "USD",
  invoiceDate: "",
  dueDate: "",
  description: "",
};

export default function AddInvoiceDialog({
  open,
  onClose,
  onCreated,
}: AddInvoiceDialogProps) {
  const [form, setForm] = useState<InvoiceFormValues>(initialValues);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(
    field: keyof InvoiceFormValues,
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          invoiceNumber: form.invoiceNumber.trim(),
          vendorName: form.vendorName.trim(),
          vendorEmail: form.vendorEmail.trim(),
          amount: Number(form.amount),
          currency: form.currency.trim().toUpperCase(),
          description: form.description.trim(),
        }),
      });

      const data: InvoiceApiResponse = await response.json();

      if (!response.ok || !data.success || !data.invoice) {
        throw new Error(data.error || "Could not create the invoice.");
      }

      onCreated(data.invoice);
      setForm(initialValues);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-invoice-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Invoice management
            </p>
            <h2
              id="add-invoice-title"
              className="mt-1 text-xl font-semibold text-slate-900"
            >
              Add new invoice
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the vendor and invoice information below.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close form"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-7">
            <div>
              <label
                htmlFor="invoiceNumber"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Invoice number *
              </label>
              <input
                id="invoiceNumber"
                name="invoiceNumber"
                required
                maxLength={50}
                value={form.invoiceNumber}
                onChange={(event) =>
                  updateField("invoiceNumber", event.target.value)
                }
                placeholder="INV-2026-007"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="vendorName"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Vendor name *
              </label>
              <input
                id="vendorName"
                name="vendorName"
                required
                minLength={2}
                maxLength={150}
                value={form.vendorName}
                onChange={(event) =>
                  updateField("vendorName", event.target.value)
                }
                placeholder="Acme Supplies Ltd."
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="vendorEmail"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Vendor email
              </label>
              <input
                id="vendorEmail"
                name="vendorEmail"
                type="email"
                value={form.vendorEmail}
                onChange={(event) =>
                  updateField("vendorEmail", event.target.value)
                }
                placeholder="billing@example.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Invoice amount *
              </label>
              <div className="flex gap-2">
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  required
                  min="0.01"
                  max="999999999"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    updateField("amount", event.target.value)
                  }
                  placeholder="2500.00"
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <select
                  aria-label="Currency"
                  name="currency"
                  value={form.currency}
                  onChange={(event) =>
                    updateField("currency", event.target.value)
                  }
                  className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="USD">USD</option>
                  <option value="PKR">PKR</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                  <option value="AED">AED</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="invoiceDate"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Invoice date *
              </label>
              <input
                id="invoiceDate"
                name="invoiceDate"
                type="date"
                required
                value={form.invoiceDate}
                onChange={(event) =>
                  updateField("invoiceDate", event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Due date *
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                required
                value={form.dueDate}
                onChange={(event) =>
                  updateField("dueDate", event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                minLength={3}
                maxLength={1000}
                rows={3}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Describe the goods or services on this invoice..."
                className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 sm:col-span-2"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="min-h-11 rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle size={16} className="animate-spin" />
              )}
              {submitting ? "Saving invoice..." : "Create invoice"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
