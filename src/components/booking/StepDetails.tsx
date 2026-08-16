"use client";

import { motion } from "framer-motion";
import { NotebookPen, Phone, User } from "lucide-react";
import type { ServiceDTO } from "@/types";
import StepHeading from "./StepHeading";
import BookingSummary from "./BookingSummary";
import { NOTES_MAX, toArabicDigits, type BookingFormState } from "./helpers";

interface StepDetailsProps {
  form: BookingFormState;
  touched: { name: boolean; phone: boolean };
  errors: { name: string; phone: string };
  service: ServiceDTO | null;
  date: string | null;
  time: string | null;
  onChange: (field: keyof BookingFormState, value: string) => void;
  onBlur: (field: "name" | "phone") => void;
}

const INPUT_BASE =
  "input-base focus:outline-none focus:ring-2 focus:ring-brand-100";

/** الخطوة 4 — بيانات المريض مع ملخص جانبي للاختيارات */
export default function StepDetails({
  form,
  touched,
  errors,
  service,
  date,
  time,
  onChange,
  onBlur,
}: StepDetailsProps) {
  const nameInvalid = touched.name && errors.name !== "";
  const phoneInvalid = touched.phone && errors.phone !== "";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_330px]">
      <div>
        <StepHeading
          title="بياناتك"
          subtitle="نحتاج بيانات بسيطة فقط لتأكيد حجزك والتواصل معك — بياناتك محمية ولن نشاركها مع أي طرف."
        />

        <div className="space-y-5">
          {/* الاسم */}
          <div>
            <label htmlFor="bk-name" className="label-base flex items-center gap-1.5">
              <User className="h-4 w-4 text-brand-600" />
              الاسم الكريم
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="bk-name"
              type="text"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              onBlur={() => onBlur("name")}
              placeholder="مثال: أحمد محمد"
              autoComplete="name"
              maxLength={80}
              aria-invalid={nameInvalid}
              className={`${INPUT_BASE} ${
                nameInvalid
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                  : "focus:border-brand-500"
              }`}
            />
            {nameInvalid ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mt-1.5 text-xs font-bold text-rose-600"
              >
                {errors.name}
              </motion.p>
            ) : (
              <p className="mt-1.5 text-xs text-ink-400">
                سنناديك بهذا الاسم عند الاستقبال.
              </p>
            )}
          </div>

          {/* الموبايل */}
          <div>
            <label htmlFor="bk-phone" className="label-base flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-brand-600" />
              رقم الموبايل
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="bk-phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              onBlur={() => onBlur("phone")}
              placeholder="01012345678"
              autoComplete="tel"
              maxLength={16}
              aria-invalid={phoneInvalid}
              className={`${INPUT_BASE} text-left ${
                phoneInvalid
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                  : "focus:border-brand-500"
              }`}
            />
            {phoneInvalid ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mt-1.5 text-xs font-bold text-rose-600"
              >
                {errors.phone}
              </motion.p>
            ) : (
              <p className="mt-1.5 text-xs text-ink-400">
                مثال: 01012345678 — سنتواصل معك على هذا الرقم لتأكيد الموعد.
              </p>
            )}
          </div>

          {/* ملاحظات */}
          <div>
            <label htmlFor="bk-notes" className="label-base flex items-center gap-1.5">
              <NotebookPen className="h-4 w-4 text-brand-600" />
              ملاحظات إضافية
              <span className="text-[10px] font-medium text-ink-400">(اختياري)</span>
            </label>
            <textarea
              id="bk-notes"
              rows={4}
              value={form.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="هل هناك تفاصيل تودّ إخبار الطبيب بها؟ (حساسية من أدوية، حالة معينة...)"
              maxLength={NOTES_MAX}
              className={`${INPUT_BASE} resize-none focus:border-brand-500`}
            />
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <p className="text-xs text-ink-400">
                تساعد الملاحظات الطبيب على التحضير المسبق لزيارتك.
              </p>
              <p className="shrink-0 text-[11px] font-bold tabular-nums text-ink-300">
                {toArabicDigits(form.notes.length)} / {toArabicDigits(NOTES_MAX)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="self-start lg:sticky lg:top-28">
        <BookingSummary service={service} date={date} time={time} />
      </div>
    </div>
  );
}
