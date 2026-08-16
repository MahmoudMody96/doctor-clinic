"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Info } from "lucide-react";
import { addDays, DAY_NAMES_AR, MONTHS_AR, todayCairo } from "@/lib/utils";
import StepHeading from "./StepHeading";

const DAYS_COUNT = 12;

interface StepDateProps {
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

function dayInfo(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return {
    weekday: DAY_NAMES_AR[d.getDay()],
    dayNum: d.getDate(),
    month: MONTHS_AR[d.getMonth()],
  };
}

/** الخطوة 2 — اختيار اليوم من تقويم الـ ١٢ يومًا القادمة */
export default function StepDate({ selectedDate, onSelect }: StepDateProps) {
  const days = useMemo(() => {
    const start = todayCairo();
    return Array.from({ length: DAYS_COUNT }, (_, i) => addDays(start, i));
  }, []);
  const today = days[0];

  return (
    <div>
      <StepHeading
        title="اختر اليوم المناسب"
        subtitle="متاح الحجز خلال الأيام الاثني عشر القادمة — وإذا كان اليوم الذي تختاره مغلقًا سنخبرك فورًا في الخطوة التالية."
      />

      <div
        role="radiogroup"
        aria-label="اختر يوم الحجز"
        className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
      >
        {days.map((date, i) => {
          const info = dayInfo(date);
          const selected = date === selectedDate;
          const disabled = date < today;
          const badge = i === 0 ? "اليوم" : i === 1 ? "غدًا" : null;
          return (
            <motion.button
              key={date}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onSelect(date)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.035, duration: 0.3, ease: "easeOut" }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-4 transition-all duration-300 ${
                selected
                  ? "border-transparent bg-gradient-to-b from-brand-600 to-brand-700 text-white shadow-glow"
                  : disabled
                    ? "cursor-not-allowed border-ink-100 bg-ink-50/60 text-ink-300"
                    : "border-ink-100 bg-white text-ink-900 shadow-card hover:-translate-y-0.5 hover:border-brand-400"
              }`}
            >
              {badge && (
                <span
                  className={`absolute -top-2.5 right-1/2 translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow ${
                    selected
                      ? "bg-white text-brand-700"
                      : "bg-gold-400 text-ink-900"
                  }`}
                >
                  {badge}
                </span>
              )}
              <span
                className={`flex items-center gap-1 text-[11px] font-bold ${
                  selected
                    ? "text-brand-100"
                    : disabled
                      ? "text-ink-300"
                      : "text-ink-400"
                }`}
              >
                <CalendarDays className="h-3 w-3" />
                {info.weekday}
              </span>
              <span className="font-display text-2xl font-extrabold leading-none">
                {info.dayNum}
              </span>
              <span
                className={`text-[11px] font-bold ${
                  selected ? "text-brand-100" : "text-ink-400"
                }`}
              >
                {info.month}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs font-bold text-ink-400">
        <Info className="h-3.5 w-3.5 shrink-0 text-brand-500" />
        أيام الإجازة أو المواعيد الممتلئة ستظهر رسالتها عند اختيار الوقت.
      </p>
    </div>
  );
}
