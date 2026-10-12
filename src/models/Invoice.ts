
import mongoose, { Schema, type Model } from "mongoose";
import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/types/invoice";

export interface InvoiceDocument {
  invoiceNumber: string;
  vendorName: string;
  vendorEmail?: string;
  amount: number;
  currency: string;
  invoiceDate: Date;
  dueDate: Date;
  description: string;
  status: InvoiceStatus;
  isDuplicate: boolean;
  duplicateOf?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<InvoiceDocument>(
  {
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: 50,
    },
    vendorName: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
      maxlength: 150,
    },
    vendorEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "USD",
      minlength: 3,
      maxlength: 3,
    },
    invoiceDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: INVOICE_STATUSES,
      default: "needs_review",
      required: true,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

InvoiceSchema.index({ status: 1, createdAt: -1 });
InvoiceSchema.index({ vendorName: 1 });

const Invoice: Model<InvoiceDocument> =
  (mongoose.models.Invoice as Model<InvoiceDocument>) ||
  mongoose.model<InvoiceDocument>("Invoice", InvoiceSchema);

export default Invoice;
