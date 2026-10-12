import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { INVOICE_STATUSES } from "@/types/invoice";

const createInvoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .trim()
    .min(1, "Invoice number is required")
    .max(50, "Invoice number cannot exceed 50 characters"),

  vendorName: z
    .string()
    .trim()
    .min(2, "Vendor name must contain at least 2 characters")
    .max(150, "Vendor name cannot exceed 150 characters"),

  vendorEmail: z
    .union([
      z.string().trim().email("Enter a valid email address"),
      z.literal(""),
    ])
    .optional(),

  amount: z.coerce
    .number()
    .finite("Enter a valid amount")
    .positive("Amount must be greater than zero")
    .max(999999999, "Amount is too large"),

  currency: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .pipe(z.string().regex(/^[A-Z]{3}$/, "Use a 3-letter currency code")),

  invoiceDate: z.iso.date("Enter a valid invoice date"),

  dueDate: z.iso.date("Enter a valid due date"),

  description: z
    .string()
    .trim()
    .min(3, "Description must contain at least 3 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
});

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");

    if (
      status &&
      status !== "decisions" &&
      !INVOICE_STATUSES.includes(status as (typeof INVOICE_STATUSES)[number])
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status filter.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const filter = {
      ...(status === "decisions"
        ? { status: { $in: ["approved", "rejected"] } }
        : status
          ? { status }
          : {}),
    };

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        invoices,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/invoices failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve invoices. Please try again.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Request body must be valid JSON.",
        },
        { status: 400 },
      );
    }

    const validation = createInvoiceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message ?? "Invalid invoice data.",
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    await connectToDatabase();

    const existingInvoice = await Invoice.findOne({
      invoiceNumber: data.invoiceNumber,
    }).select("_id");

    if (existingInvoice) {
      return NextResponse.json(
        {
          success: false,
          error: "An invoice with this invoice number already exists.",
        },
        { status: 409 },
      );
    }

    const invoice = await Invoice.create({
      invoiceNumber: data.invoiceNumber,
      vendorName: data.vendorName,
      vendorEmail: data.vendorEmail || undefined,
      amount: data.amount,
      currency: data.currency,
      invoiceDate: new Date(`${data.invoiceDate}T00:00:00.000Z`),
      dueDate: new Date(`${data.dueDate}T00:00:00.000Z`),
      description: data.description,
      status: "needs_review",
      isDuplicate: false,
      duplicateOf: null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invoice created successfully.",
        invoice: invoice.toObject(),
      },
      { status: 201 },
    );
  } catch (error) {
    // Handle duplicate invoice numbers if concurrent requests arrive.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "An invoice with this invoice number already exists.",
        },
        { status: 409 },
      );
    }

    console.error("POST /api/invoices failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create invoice. Please try again.",
      },
      { status: 500 },
    );
  }
}
