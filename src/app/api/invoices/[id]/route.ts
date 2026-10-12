import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { isValidObjectId } from "@/lib/utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
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

    await connectToDatabase();

    const invoice = await Invoice.findById(id).lean();

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, invoice },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("GET /api/invoices/[id] failed:", error);

    return NextResponse.json(
      { success: false, error: "Unable to retrieve invoice." },
      { status: 500 },
    );
  }
}