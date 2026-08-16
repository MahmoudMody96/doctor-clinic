import type { BookingStatus } from "@/types";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";

/** شارة حالة الحجز بألوان النظام الجاهزة */
export default function StatusBadge({
  status,
  className = "",
}: {
  status: BookingStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${STATUS_COLORS[status]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
