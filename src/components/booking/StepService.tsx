"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CircleCheck,
  Hourglass,
  RefreshCw,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import type { ServiceDTO } from "@/types";
import { formatPrice } from "@/lib/utils";
import ServiceIcon from "@/components/ServiceIcon";
import StepHeading from "./StepHeading";
import { durationLabelAr } from "./helpers";

const SKELETON =
  "animate-shimmer rounded-full bg-gradient-to-l from-ink-100 via-ink-50 to-ink-100 bg-[length:200%_100%]";

interface StepServiceProps {
  services: ServiceDTO[] | null;
  loading: boolean;
  error: string | null;
  selectedId: number | null;
  onSelect: (service: ServiceDTO) => void;
  onRetry: () => void;
}

function StateMessage({
  icon: Icon,
  title,
  hint,
  actionLabel,
  onAction,
  tone = "danger",
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "danger" | "neutral";
}) {
  const badge =
    tone === "danger"
      ? "bg-rose-50 text-rose-500"
      : "bg-ink-100 text-ink-400";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-ink-100 bg-white px-6 py-14 text-center shadow-card"
    >
      <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${badge}`}>
        <Icon className="h-8 w-8" />
      </span>
      <div>
        <h3 className="font-display text-lg font-extrabold text-ink-900">{title}</h3>
        {hint && <p className="mt-1.5 text-sm leading-7 text-ink-500">{hint}</p>}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-outline text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}

/** الخطوة 1 — اختيار الخدمة من شبكة بطاقات */
export default function StepService({
  services,
  loading,
  error,
  selectedId,
  onSelect,
  onRetry,
}: StepServiceProps) {
  return (
    <div>
      <StepHeading
        title="اختر الخدمة المناسبة"
        subtitle="كل خدمة تُنفَّذ بأحدث التقنيات وبخطة علاج واضحة — اختر ما تحتاجه وسنعتني بالباقي."
      />

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="جارٍ تحميل الخدمات">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className={`${SKELETON} h-12 w-12 rounded-xl!`} />
                <div className={`${SKELETON} h-4 w-24`} />
              </div>
              <div className={`${SKELETON} mt-4 h-3 w-full`} />
              <div className={`${SKELETON} mt-2 h-3 w-2/3`} />
              <div className="mt-5 flex items-center justify-between">
                <div className={`${SKELETON} h-5 w-20`} />
                <div className={`${SKELETON} h-6 w-16`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <StateMessage
          icon={AlertTriangle}
          title="تعذر تحميل الخدمات"
          hint={error}
          actionLabel="إعادة المحاولة"
          onAction={onRetry}
        />
      )}

      {!loading && !error && services && services.length === 0 && (
        <StateMessage
          icon={Stethoscope}
          title="لا توجد خدمات متاحة حاليًا"
          hint="نعمل على تحديث قائمة الخدمات — يرجى المحاولة مرة أخرى لاحقًا."
          tone="neutral"
        />
      )}

      {!loading && !error && services && services.length > 0 && (
        <div
          role="group"
          aria-label="اختر الخدمة"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service, i) => {
            const selected = service.id === selectedId;
            return (
              <motion.button
                key={service.id}
                type="button"
                aria-pressed={selected}
                aria-label={`${service.name} — ${formatPrice(service.price)} — ${durationLabelAr(service.durationMin)}`}
                onClick={() => onSelect(service)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
                whileTap={{ scale: 0.98 }}
                className={`group relative flex flex-col rounded-2xl border-2 p-5 text-right transition-all duration-300 ${
                  selected
                    ? "border-brand-500 bg-gradient-to-br from-brand-50 to-white shadow-glow"
                    : "border-ink-100 bg-white shadow-card hover:-translate-y-1 hover:border-brand-300"
                }`}
              >
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={{ scale: selected ? 1 : 0.4, opacity: selected ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 20 }}
                  className="absolute left-4 top-4 text-brand-600"
                >
                  <CircleCheck className="h-6 w-6" />
                </motion.span>

                <span
                  className={`flex h-13 w-13 items-center justify-center rounded-2xl text-white shadow-card transition-all duration-300 group-hover:scale-105 ${
                    selected
                      ? "bg-gradient-to-br from-brand-400 to-brand-600"
                      : "bg-gradient-to-br from-brand-500 to-brand-700"
                  }`}
                >
                  <ServiceIcon name={service.icon} className="h-6 w-6" />
                </span>

                <h3 className="mt-4 font-display text-base font-extrabold text-ink-900">
                  {service.name}
                </h3>
                <p className="mt-1.5 line-clamp-2 min-h-10 text-[13px] leading-6 text-ink-600">
                  {service.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink-100 pt-3.5">
                  <span className="font-display text-base font-extrabold text-brand-700">
                    {formatPrice(service.price)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-2.5 py-1 text-xs font-bold text-ink-600">
                    <Hourglass className="h-3.5 w-3.5 text-brand-500" />
                    {durationLabelAr(service.durationMin)}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
