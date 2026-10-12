# Sledge Invoice Approval Desk

A full-stack invoice management and approval dashboard built with Next.js, TypeScript, Tailwind CSS, MongoDB, Mongoose, and Zod.

The application helps users review invoices, identify flagged duplicates, inspect invoice details, and record approval or rejection decisions.

## Features

- **Invoice dashboard:** View invoice summaries and status counts.
- **Status tabs:** Organize invoices into Processing, Needs review, and Approved / Rejected.
- **Invoice details:** Inspect vendor information, amounts, dates, descriptions, and duplicate indicators.
- **Approval workflow:** Approve or reject invoices through a confirmation dialog.
- **Persistent decisions:** Save invoice status changes in MongoDB.
- **Decision protection:** Prevent invoices that already have a final decision from being decided again.
- **Invoice creation:** Add invoices through a validated form.
- **Duplicate protection:** Reject invoice creation when the invoice number already exists.
- **Duplicate sample:** Includes a sample invoice linked to its original invoice for review.
- **CSV export:** Export invoice information for further analysis.
- **Input validation:** Validate request data using Zod and enforce database schema rules with Mongoose.
- **Responsive interface:** Use the dashboard on desktop and smaller screens.

## Technology Stack

- Next.js 16 with App Router
- React and TypeScript
- Tailwind CSS
- MongoDB
- Mongoose
- Zod
- Lucide React

## Prerequisites

Before running the project, install:

- Node.js and npm
- MongoDB Community Server, running locally, or access to a MongoDB database
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd sledge-invoice-desk
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/sledge-invoice-desk
```

This connection string is for a local MongoDB server. Ensure MongoDB is running before starting the application.

For a hosted MongoDB database, use your own connection URI instead. Keep credentials private and never commit `.env.local`.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Seed the sample invoices

The project includes a seed script that checks six sample invoices and inserts any that do not already exist. It also links the duplicate sample to its original invoice.

Run these commands in PowerShell from the project root:

```powershell
$env:DOTENV_CONFIG_PATH = ".env.local"
npx tsx -r dotenv/config src/scripts/seed-invoices.ts
```

The script uses upserts, so existing sample invoices are not reset to their original statuses on subsequent runs.

## Sample Data

The seed script includes six invoices:

| Invoice | Initial status | Notes |
|---|---|---|
| INV-2026-001 | Needs review | Original Acme Supplies invoice |
| INV-2026-002 | Processing | Software subscription |
| INV-2026-003 | Needs review | Flagged duplicate of INV-2026-001 |
| INV-2026-004 | Approved | Marketing services |
| INV-2026-005 | Rejected | Logistics charges |
| INV-2026-006 | Processing | Design services |

The initial statuses above describe the seed data. Approval and rejection actions can change these statuses in the database.

## Invoice Status Model

The application uses four statuses:

- **`processing`** — The invoice is being processed and has not received a final decision.
- **`needs_review`** — The invoice requires review before a decision.
- **`approved`** — The invoice has been approved.
- **`rejected`** — The invoice has been rejected.

The dashboard groups approved and rejected invoices in a combined tab.

### Database Schema

The Invoice model contains:

| Field | Purpose |
|---|---|
| `invoiceNumber` | Unique invoice identifier |
| `vendorName` | Vendor or supplier name |
| `vendorEmail` | Optional vendor email address |
| `amount` | Invoice amount |
| `currency` | Three-letter currency code |
| `invoiceDate` | Invoice issue date |
| `dueDate` | Payment due date |
| `description` | Invoice description |
| `status` | Current invoice status |
| `isDuplicate` | Indicates whether the invoice is flagged as a duplicate |
| `duplicateOf` | Optional reference to the original invoice |
| `createdAt` | Record creation timestamp |
| `updatedAt` | Last update timestamp |

Mongoose validates required fields, applies the permitted status values, and enforces unique invoice numbers. Indexes support common status and vendor queries.

### Approval and Rejection Rules

1. Only `approved` and `rejected` are final decision statuses.
2. A reviewer selects an action and confirms it through the interface.
3. The status API validates the requested decision and persists the update in MongoDB.
4. Attempts to decide an invoice that already has a final status are rejected with an HTTP `409 Conflict` response.
5. Duplicate flags help reviewers identify invoices that need additional attention.

## REST API

### List invoices

`GET /api/invoices`

Returns the invoice collection.

Optional query parameter:

- `status=processing`
- `status=needs_review`
- `status=approved`
- `status=rejected`
- `status=decisions` — returns approved and rejected invoices together

Example:

```http
GET /api/invoices?status=needs_review
```

### Get a single invoice

`GET /api/invoices/:id`

Returns an invoice by its MongoDB document ID.

Example:

```http
GET /api/invoices/REPLACE_WITH_MONGODB_ID
```

### Create an invoice

`POST /api/invoices`

Creates an invoice after validating the request body. Newly created invoices begin with `needs_review` status.

Example request body:

```json
{
  "invoiceNumber": "INV-2026-007",
  "vendorName": "Example Services Ltd.",
  "vendorEmail": "billing@example.com",
  "amount": 850,
  "currency": "USD",
  "invoiceDate": "2026-10-11",
  "dueDate": "2026-11-10",
  "description": "Consulting services"
}
```

Expected successful response: HTTP `201 Created`.

Duplicate invoice numbers return HTTP `409 Conflict`.

### Update invoice status

`PATCH /api/invoices/:id/status`

Updates the status to `approved` or `rejected`.

Example request body:

```json
{
  "status": "approved"
}
```

The endpoint validates the status and invoice ID. An invoice that already has a final decision returns HTTP `409 Conflict` rather than accepting another decision.

## Error Handling

The API uses appropriate HTTP responses, including:

- `200 OK` — successful retrieval or update
- `201 Created` — successful invoice creation
- `400 Bad Request` — invalid input, JSON, or status filter
- `404 Not Found` — invoice does not exist
- `409 Conflict` — duplicate invoice number or an invoice that already has a final decision
- `500 Internal Server Error` — unexpected server-side failure

## Production Build

Run the production build to check compilation and TypeScript errors:

```bash
npm run build
```

Start the production server with:

```bash
npm run start
```

Configure `MONGODB_URI` in the deployment environment before running the application.

## Security and Configuration

- Keep `.env.local` out of version control.
- Never publish MongoDB credentials.
- Validate incoming API data before writing to the database.
- Use a restricted database user for hosted deployments.
- Protect write endpoints with authentication and authorization before using the application in a public production environment.

## Project Scope

This project demonstrates invoice CRUD operations, API validation, MongoDB persistence, status-based filtering, duplicate flagging, and an approval workflow. It is a compact assessment project rather than a complete enterprise accounts-payable system.
