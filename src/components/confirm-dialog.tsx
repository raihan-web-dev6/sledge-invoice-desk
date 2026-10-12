"use client";

import { AlertTriangle, CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

export type DecisionAction = "approved" | "rejected";

interface ConfirmDialogProps {
  open: boolean;
  action: DecisionAction;
  invoiceNumber: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  action,
  invoiceNumber,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  const approving = action === "approved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            approving
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {approving ? (
            <CheckCircle2 size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
        </div>

        <h2
          id="confirm-dialog-title"
          className="mt-5 text-lg font-semibold text-slate-900"
        >
          {approving ? "Approve this invoice?" : "Reject this invoice?"}
        </h2>

        <p
          id="confirm-dialog-description"
          className="mt-2 text-sm leading-6 text-slate-600"
        >
          You are about to {approving ? "approve" : "reject"}{" "}
          <strong className="font-semibold text-slate-800">
            {invoiceNumber}
          </strong>
          . This decision will be saved to the database.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              approving
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {isSubmitting ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : approving ? (
              <CheckCircle2 size={16} />
            ) : (
              <XCircle size={16} />
            )}
            {isSubmitting
              ? "Saving..."
              : approving
                ? "Confirm approval"
                : "Confirm rejection"}
          </button>
        </div>
      </section>
    </div>
  );
}