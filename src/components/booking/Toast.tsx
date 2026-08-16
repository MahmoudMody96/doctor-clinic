"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CircleCheck, Info, type LucideIcon } from "lucide-react";

export type ToastType = "error" | "success" | "info";

export interface ToastData {
  id: number;
  type: ToastType;
  message: string;
}

const STYLES: Record<ToastType, { box: string; icon: string }> = {
  error: {
    box: "border-rose-200 bg-rose-50 text-rose-800",
    icon: "bg-rose-100 text-rose-600",
  },
  success: {
    box: "border-brand-200 bg-brand-50 text-brand-800",
    icon: "bg-brand-100 text-brand-600",
  },
  info: {
    box: "border-ink-200 bg-white text-ink-800",
    icon: "bg-ink-100 text-ink-600",
  },
};

const ICONS: Record<ToastType, LucideIcon> = {
  error: AlertTriangle,
  success: CircleCheck,
  info: Info,
};

/** تنبيه عائم قصير أعلى الصفحة — يُدار من المعالج الرئيسي */
export default function BookingToast({ toast }: { toast: ToastData | null }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-24 z-[70] flex justify-center px-4"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border px-4 py-3 shadow-soft ${
              STYLES[toast.type].box
            }`}
          >
            {(() => {
              const Icon = ICONS[toast.type];
              return (
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    STYLES[toast.type].icon
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
              );
            })()}
            <p className="text-sm font-bold leading-6">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
