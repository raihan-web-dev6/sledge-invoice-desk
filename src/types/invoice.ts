
export const INVOICE_STATUSES = [
  "processing",
  "needs_review",
  "approved",
  "rejected",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface IInvoice {
  _id: string;
  invoiceNumber: string;
  vendorName: string;
  vendorEmail?: string;
  amount: number;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  description: string;
  status: InvoiceStatus;
  isDuplicate: boolean;
  duplicateOf?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceStatusUpdate {
  status: "approved" | "rejected";
}

export interface InvoiceApiResponse {
  success: boolean;
  message?: string;
  invoice?: IInvoice;
  invoices?: IInvoice[];
  error?: string;
}
