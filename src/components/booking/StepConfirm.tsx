"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  NotebookPen,
  Phone,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ServiceDTO } from "@/types";
import { normalizeDigits } from "@/lib/utils";
import StepHeading from "./StepHeading";
import BookingSummary from "./BookingSummary";
import type { BookingFormState } from "./helpers";

interface StepConfirmProps {
  form: BookingFormState;
  service: ServiceDTO | null;
  date: string | null;
  time: string | null;
  submitError: string | null;
}

function ReviewRow({
  icon,
  label,
  value,
  ltr = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-center gap-3.5 px-5 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-ink-400">{label}</p>
        <p
          dir={ltr ? "ltr" : undefined}
          className={`truncate text-sm font-extrabold text-ink-900 ${ltr ? "text-right" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function RowIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="h-4.5 w-4.5" />;
}

/** الخطوة 5 — مراجعة نهائية قبل تأكيد الحجز */
export default function StepConfirm({
  form,
  service,
  date,
  time,
  submitError,
}: StepConfirmProps) {
  const notes = form.notes.trim();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_330px]">
      <div>
        <StepHeading
          title="راجع حجزك قبل التأكيد"
          subtitle="نظرة أخيرة سريعة على التفاصيل — عند الضغط على «تأكيد الحجز» ستصلك شاشة النجاح مع رقمك المرجعي."
        />

        <div className="card-base divide-y divide-ink-100 overflow-hidden">
          <ReviewRow
            icon={<RowIcon icon={User} />}
            label="الاسم"
            value={form.name.trim()}
          />
          <ReviewRow
            icon={<RowIcon icon={Phone} />}
            label="رقم الموبايل"
            value={normalizeDigits(form.phone).replace(/[\s-]/g, "")}
            ltr
          />
          {notes && (
            <ReviewRow
              icon={<RowIcon icon={NotebookPen} />}
              label="ملاحظات"
              value={notes}
            />
          )}
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-xs leading-6 text-brand-900">
            بياناتك محفوظة بسرية تامة ولا تُستخدم إلا للتواصل بشأن حجزك. لا
            يتطلب الحجز أي دفع مقدم — يُدفع السعر في العيادة وقت الزيارة.
          </p>
        </div>

        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mt-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-bold text-rose-700"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            {submitError}
          </motion.div>
        )}
      </div>

      <div className="self-start lg:sticky lg:top-28">
        <BookingSummary service={service} date={date} time={time} />
      </div>
    </div>
  );
}
