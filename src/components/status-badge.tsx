
import { CheckCircle2, Clock3, XCircle, CircleAlert } from "lucide-react";
import type { InvoiceStatus } from "@/types/invoice";
import { getStatusLabel } from "@/lib/utils";

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusStyles: Record<
  InvoiceStatus,
  { icon: typeof Clock3; color: string }
> = {
  processing: {
    icon: Clock3,
    color: "status-processing",
  },
  needs_review: {
    icon: CircleAlert,
    color: "status-review",
  },
  approved: {
    icon: CheckCircle2,
    color: "status-approved",
  },
  rejected: {
    icon: XCircle,
    color: "status-rejected",
  },
};

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  const config = statusStyles[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${config.color} ${className}`}
    >
      <Icon size={13} strokeWidth={2} aria-hidden="true" />
      {getStatusLabel(status)}
    </span>
  );
}
