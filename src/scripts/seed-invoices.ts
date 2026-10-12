import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import { connectToDatabase } from "../lib/mongodb";
import Invoice from "../models/Invoice";

const sampleInvoices = [
  {
    invoiceNumber: "INV-2026-001",
    vendorName: "Acme Supplies Ltd.",
    vendorEmail: "billing@acmesupplies.example",
    amount: 2450,
    currency: "USD",
    invoiceDate: new Date("2026-10-10"),
    dueDate: new Date("2026-11-10"),
    description: "Office equipment and supplies for the operations team.",
    status: "needs_review" as const,
    isDuplicate: false,
    duplicateOf: null,
  },
  {
    invoiceNumber: "INV-2026-002",
    vendorName: "Northstar Technologies",
    vendorEmail: "accounts@northstar.example",
    amount: 899,
    currency: "USD",
    invoiceDate: new Date("2026-10-09"),
    dueDate: new Date("2026-11-08"),
    description: "Monthly software subscription and support.",
    status: "processing" as const,
    isDuplicate: false,
    duplicateOf: null,
  },
  {
    invoiceNumber: "INV-2026-003",
    vendorName: "Acme Supplies Ltd.",
    vendorEmail: "billing@acmesupplies.example",
    amount: 2450,
    currency: "USD",
    invoiceDate: new Date("2026-10-10"),
    dueDate: new Date("2026-11-10"),
    description: "Possible duplicate of INV-2026-001. Verify before approval.",
    status: "needs_review" as const,
    isDuplicate: true,
    duplicateOf: null,
  },
  {
    invoiceNumber: "INV-2026-004",
    vendorName: "Brightline Marketing",
    vendorEmail: "finance@brightline.example",
    amount: 1200,
    currency: "USD",
    invoiceDate: new Date("2026-10-07"),
    dueDate: new Date("2026-10-28"),
    description: "Monthly marketing and campaign management services.",
    status: "approved" as const,
    isDuplicate: false,
    duplicateOf: null,
  },
  {
    invoiceNumber: "INV-2026-005",
    vendorName: "Greenfield Logistics",
    vendorEmail: "invoices@greenfield.example",
    amount: 675.5,
    currency: "USD",
    invoiceDate: new Date("2026-10-06"),
    dueDate: new Date("2026-10-30"),
    description: "Delivery and transportation charges for September.",
    status: "rejected" as const,
    isDuplicate: false,
    duplicateOf: null,
  },
  {
    invoiceNumber: "INV-2026-006",
    vendorName: "Pixelwave Design Studio",
    vendorEmail: "billing@pixelwave.example",
    amount: 1575,
    currency: "USD",
    invoiceDate: new Date("2026-10-05"),
    dueDate: new Date("2026-11-05"),
    description: "Product interface design and asset preparation.",
    status: "processing" as const,
    isDuplicate: false,
    duplicateOf: null,
  },
];

async function seedInvoices() {
  try {
    await connectToDatabase();

    for (const sample of sampleInvoices) {
      await Invoice.updateOne(
        { invoiceNumber: sample.invoiceNumber },
        { $setOnInsert: sample },
        { upsert: true, runValidators: true },
      );
    }

    // Connect the duplicate record to the original invoice.
    const original = await Invoice.findOne({
      invoiceNumber: "INV-2026-001",
    }).select("_id");

    if (original) {
      await Invoice.updateOne(
        { invoiceNumber: "INV-2026-003" },
        { $set: { duplicateOf: original._id, isDuplicate: true } },
      );
    }

    console.log(`Seed complete. Checked ${sampleInvoices.length} sample invoices.`);
  } catch (error) {
    console.error("Invoice seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedInvoices();