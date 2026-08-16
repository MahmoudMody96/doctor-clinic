"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CalendarX2,
  Clock,
  History,
  RefreshCw,
  Sunrise,
  Sunset,
  type LucideIcon,
} from "lucide-react";
import type { ServiceDTO } from "@/types";
import { formatDateAr, formatTime12 } from "@/lib/utils";
import StepHeading from "./StepHeading";
import {
  groupSlots,
  slotsCountAr,
  type AvailabilityState,
} from "./helpers";

const SKELETON =
  "animate-shimmer rounded-xl bg-gradient-to-l from-ink-100 via-ink-50 to-ink-100 bg-[length:200%_100%]";

interface StepTimeProps {
  service: ServiceDTO | null;
  date: string | null;
  state: AvailabilityState;
  selectedTime: string | null;
  onSelect: (time: string) => void;
  onBack: () => void;
  onRetry: () => void;
}

/** بطاقة حالة موحّدة (إجازة / مغلق / لا فتحات / خطأ) */
function StateCard({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action: { label: string; onClick: () => void; variant: "back" | "retry" };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-ink-100 bg-white px-6 py-12 text-center shadow-card"
    >
      <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-50 text-ink-400">
        <Icon className="h-8 w-8" />
      </span>
      <div>
        <h3 className="font-display text-lg font-extrabold text-ink-900">{title}</h3>
        {hint && <p className="mt-1.5 text-sm leading-7 text-ink-500">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={action.onClick}
        className={
          action.variant === "back"
            ? "btn-outline text-sm"
            : "btn-primary text-sm"
        }
      >
        {action.variant === "back" ? (
          <>
            <ArrowRight className="h-4 w-4" />
            {action.label}
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            {action.label}
          </>
        )}
      </button>
    </motion.div>
  );
}

/** الخطوة 3 — عرض الفتحات المتاحة مجمّعة صباحيًا ومسائيًا */
export default function StepTime({
  service,
  date,
  state,
  selectedTime,
  onSelect,
  onBack,
  onRetry,
}: StepTimeProps) {
  const backAction = { label: "اختيار يوم آخر", onClick: onBack, variant: "back" } as const;

  return (
    <div>
      <StepHeading
        title="اختر الوقت المناسب"
        subtitle="هذه أوقات العمل الفعلية المتاحة أمام خدمتك — الفتحات تُحدَّث لحظيًا."
      />

      {/* شريط سياق الاختيار الحالي */}
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-xs font-bold text-brand-800">
        <CalendarDays className="h-4 w-4 text-brand-600" />
        {date ? formatDateAr(date) : "—"}
        <span aria-hidden className="text-brand-300">•</span>
        {service?.name ?? "—"}
      </div>

      {state.status === "loading" && (
        <div className="space-y-7" aria-busy="true" aria-label="جارٍ تحميل المواعيد المتاحة">
          {[0, 1].map((g) => (
            <div key={g}>
              <div className="mb-3 flex items-center gap-3">
                <div className={`${SKELETON} h-4 w-28`} />
                <div className="h-px flex-1 bg-ink-100" />
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`${SKELETON} h-11`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {state.status === "error" && (
        <StateCard
          icon={AlertTriangle}
          title="تعذر تحميل المواعيد"
          hint={state.message}
          action={{ label: "إعادة المحاولة", onClick: onRetry, variant: "retry" }}
        />
      )}

      {state.status === "success" && state.data.offDay && (
        <StateCard
          icon={CalendarX2}
          title="العيادة مغلقة هذا اليوم"
          hint="يوم الإجازة الأسبوعي — اختر يومًا آخر من التقويم وسنعرض لك أوقات العمل فورًا."
          action={backAction}
        />
      )}

      {state.status === "success" && !state.data.offDay && state.data.blocked && (
        <StateCard
          icon={CalendarX2}
          title="هذا التاريخ مغلق (إجازة)"
          hint="لدينا إجازة رسمية في هذا اليوم — يرجى اختيار يوم آخر."
          action={backAction}
        />
      )}

      {state.status === "success" &&
        !state.data.offDay &&
        !state.data.blocked &&
        state.data.past && (
          <StateCard
            icon={History}
            title="لا يمكن الحجز في يومٍ مضى"
            hint="اختر يومًا قادمًا من التقويم."
            action={backAction}
          />
        )}

      {state.status === "success" &&
        !state.data.offDay &&
        !state.data.blocked &&
        !state.data.past &&
        state.data.serviceMissing && (
          <StateCard
            icon={AlertTriangle}
            title="الخدمة المختارة غير متاحة"
            hint="يبدو أن هذه الخدمة لم تعد متاحة — يرجى العودة واختيار خدمة أخرى."
            action={backAction}
          />
        )}

      {state.status === "success" &&
        !state.data.offDay &&
        !state.data.blocked &&
        !state.data.past &&
        !state.data.serviceMissing &&
        state.data.slots.length === 0 && (
          <StateCard
            icon={Clock}
            title="لا توجد مواعيد متاحة هذا اليوم"
            hint="جميع المواعيد محجوزة بالفعل — جرّب يومًا آخر قريبًا."
            action={backAction}
          />
        )}

      {state.status === "success" &&
        !state.data.offDay &&
        !state.data.blocked &&
        !state.data.past &&
        !state.data.serviceMissing &&
        state.data.slots.length > 0 && (
          <div className="space-y-7">
            {groupSlots(state.data.slots).map((group) => {
              const GroupIcon = group.key === "morning" ? Sunrise : Sunset;
              return (
                <section key={group.key}>
                  <header className="mb-3 flex items-center gap-2">
                    <GroupIcon
                      className={`h-4.5 w-4.5 ${
                        group.key === "morning" ? "text-gold-500" : "text-brand-600"
                      }`}
                    />
                    <h3 className="text-sm font-extrabold text-ink-800">
                      {group.title}
                    </h3>
                    <span className="rounded-full bg-ink-50 px-2 py-0.5 text-xs font-bold text-ink-600">
                      {slotsCountAr(group.slots.length)}
                    </span>
                    <span aria-hidden className="h-px flex-1 bg-ink-100" />
                  </header>

                  <div
                    role="group"
                    aria-label={group.title}
                    className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6"
                  >
                    {group.slots.map((slot, i) => {
                      const selected = slot === selectedTime;
                      return (
                        <motion.button
                          key={slot}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onSelect(slot)}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.025, duration: 0.25, ease: "easeOut" }}
                          whileTap={{ scale: 0.94 }}
                          className={`min-h-[44px] rounded-xl border-2 px-1 py-3 text-sm font-extrabold tabular-nums transition-all duration-200 ${
                            selected
                              ? "border-transparent bg-gradient-to-b from-brand-800 to-brand-700 text-white shadow-glow"
                              : "border-ink-100 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-700"
                          }`}
                        >
                          {formatTime12(slot)}
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
    </div>
  );
}
