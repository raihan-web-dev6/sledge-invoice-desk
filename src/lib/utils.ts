
import type { InvoiceStatus } from "@/types/invoice";

export function formatCurrency(
  amount: number,
  currency = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

export function getStatusLabel(status: InvoiceStatus): string {
  const labels: Record<InvoiceStatus, string> = {
    processing: "Processing",
    needs_review: "Needs Review",
    approved: "Approved",
    rejected: "Rejected",
  };

  return labels[status];
}

export function getStatusColor(status: InvoiceStatus): string {
  const colors: Record<InvoiceStatus, string> = {
    processing: "status-processing",
    needs_review: "status-review",
    approved: "status-approved",
    rejected: "status-rejected",
  };

  return colors[status];
}

export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}
