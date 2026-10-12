import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { isValidObjectId } from "@/lib/utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const statusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid invoice ID." },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Request body must be valid JSON." },
        { status: 400 },
      );
    }

    const validation = statusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Status must be either approved or rejected.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found." },
        { status: 404 },
      );
    }

    if (invoice.status === "approved" || invoice.status === "rejected") {
      return NextResponse.json(
        {
          success: false,
          error: `This invoice has already been ${invoice.status}.`,
        },
        { status: 409 },
      );
    }

    invoice.status = validation.data.status;
    await invoice.save();

    return NextResponse.json(
      {
        success: true,
        message: `Invoice ${invoice.status} successfully.`,
        invoice: invoice.toObject(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/invoices/[id]/status failed:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update invoice status." },
      { status: 500 },
    );
  }
}