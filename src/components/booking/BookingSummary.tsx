"use client";

import { CalendarDays, Clock, Sparkles, Wallet } from "lucide-react";
import type { ServiceDTO } from "@/types";
import { formatDateAr, formatPrice, formatTime12 } from "@/lib/utils";
import ServiceIcon from "@/components/ServiceIcon";
import { durationLabelAr } from "./helpers";

/** بطاقة ملخص جانبية للاختيارات الحالية (تُستخدم في خطوتي البيانات والتأكيد) */
export default function BookingSummary({
  service,
  date,
  time,
}: {
  service: ServiceDTO | null;
  date: string | null;
  time: string | null;
}) {
  return (
    <aside className="card-base overflow-hidden" aria-label="ملخص الحجز">
      <div className="flex items-center gap-2.5 bg-gradient-to-l from-ink-900 to-ink-800 px-5 py-4 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <Sparkles className="h-4.5 w-4.5 text-gold-400" />
        </span>
        <h3 className="font-display text-sm font-extrabold">ملخص حجزك</h3>
      </div>

      <div className="divide-y divide-ink-100">
        <div className="flex items-center gap-3.5 px-5 py-4">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-card ${
              service
                ? "bg-gradient-to-br from-brand-500 to-brand-700"
                : "bg-ink-200"
            }`}
          >
            {service ? (
              <ServiceIcon name={service.icon} className="h-5 w-5" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-ink-400">الخدمة</p>
            <p className="truncate text-sm font-extrabold text-ink-900">
              {service ? service.name : "—"}
            </p>
            {service && (
              <p className="mt-0.5 text-xs text-ink-400">
                المدة: {durationLabelAr(service.durationMin)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3.5 px-5 py-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-ink-400">اليوم</p>
            <p className="text-sm font-extrabold text-ink-900">
              {date ? formatDateAr(date) : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 px-5 py-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Clock className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-ink-400">الوقت</p>
            <p className="text-sm font-extrabold text-ink-900">
              {time ? formatTime12(time) : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-brand-50/60 px-5 py-4">
          <span className="flex items-center gap-2 text-xs font-extrabold text-brand-800">
            <Wallet className="h-4 w-4" />
            الإجمالي
          </span>
          <span className="font-display text-lg font-extrabold text-brand-700">
            {service ? formatPrice(service.price) : "—"}
          </span>
        </div>
      </div>

      <p className="px-5 pb-4 pt-3 text-[11px] leading-5 text-ink-400">
        السعر استرشادي ويُدفع في العيادة وقت الزيارة — لا حاجة لأي دفع مقدم.
      </p>
    </aside>
  );
}
