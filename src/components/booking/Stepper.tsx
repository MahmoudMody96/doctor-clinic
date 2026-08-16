"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock,
  Stethoscope,
  User,
  type LucideIcon,
} from "lucide-react";
import { toArabicDigits } from "./helpers";

interface StepDef {
  title: string;
  icon: LucideIcon;
}

export const BOOKING_STEPS: StepDef[] = [
  { title: "الخدمة", icon: Stethoscope },
  { title: "اليوم", icon: CalendarDays },
  { title: "الوقت", icon: Clock },
  { title: "بياناتك", icon: User },
  { title: "التأكيد", icon: ClipboardCheck },
];

interface StepperProps {
  step: number;
  /** يُستدعى عند الضغط على خطوة مكتملة للرجوع إليها */
  onStepClick?: (index: number) => void;
}

/** شريط تقدم الخطوات — دوائر بأيقونات وخط متدرج يمتلئ حسب التقدم */
export default function Stepper({ step, onStepClick }: StepperProps) {
  const total = BOOKING_STEPS.length;
  const progress = ((step - 1) / (total - 1)) * 100;

  return (
    <div>
      <div className="relative mx-auto max-w-xl">
        {/* الخط الخلفي */}
        <div
          aria-hidden
          className="absolute inset-x-5 top-5 hidden h-1 rounded-full bg-ink-100 sm:block"
        />
        {/* الخط المتدرج الممتلئ — يتمدد من اليمين لليسار */}
        <motion.div
          aria-hidden
          className="absolute right-5 top-5 hidden h-1 w-[calc(100%-2.5rem)] origin-right rounded-full bg-gradient-to-l from-brand-600 via-brand-400 to-gold-400 sm:block"
          initial={false}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        <ol className="relative flex items-start justify-between">
          {BOOKING_STEPS.map((s, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            const Icon = s.icon;
            return (
              <li key={s.title} className="flex flex-1 flex-col items-center gap-2">
                <motion.button
                  type="button"
                  onClick={() => done && onStepClick?.(i)}
                  disabled={!done}
                  aria-current={active ? "step" : undefined}
                  aria-label={`الخطوة ${toArabicDigits(n)} من ${toArabicDigits(
                    total
                  )}: ${s.title}${done ? " (مكتملة)" : ""}`}
                  initial={false}
                  animate={{ scale: active ? 1.12 : 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  className={[
                    "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300",
                    active
                      ? "border-transparent bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow"
                      : done
                        ? "cursor-pointer border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100"
                        : "cursor-default border-ink-200 bg-white text-ink-400",
                  ].join(" ")}
                >
                  {done ? (
                    <Check className="h-4.5 w-4.5" strokeWidth={3} />
                  ) : (
                    <Icon className="h-4.5 w-4.5" />
                  )}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute -bottom-1.5 h-1.5 w-1.5 rounded-full bg-gold-400"
                    />
                  )}
                </motion.button>
                <span
                  className={`hidden text-[11px] font-bold sm:block ${
                    active
                      ? "text-brand-700"
                      : done
                        ? "text-ink-600"
                        : "text-ink-400"
                  }`}
                >
                  {s.title}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* مؤشر مختصر للموبايل */}
      <div
        aria-hidden
        className="mx-auto mt-3 h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-ink-100 sm:hidden"
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-brand-600 to-brand-400"
          initial={false}
          animate={{ width: `${(step / total) * 100}%` }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />
      </div>
      <p className="mt-2 text-center text-xs font-bold text-ink-500 sm:hidden">
        الخطوة {toArabicDigits(step)} من {toArabicDigits(total)} —{" "}
        {BOOKING_STEPS[step - 1].title}
      </p>
    </div>
  );
}
