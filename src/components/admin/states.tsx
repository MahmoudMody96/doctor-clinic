"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CalendarOff,
  Loader2,
  RefreshCw,
  SearchX,
} from "lucide-react";

/** سبينر صغير */
export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

/** شريط رسائل نجاح / خطأ قابل للإغلاق */
export function Alert({
  kind,
  children,
  onClose,
}: {
  kind: "success" | "error";
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
        kind === "success"
          ? "border-teal-200 bg-teal-50 text-teal-800"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
      <span className="flex-1 leading-6">{children}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-current/70 transition hover:opacity-100 opacity-60"
          aria-label="إغلاق التنبيه"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}

/** حالة الخطأ مع زر إعادة المحاولة */
export function ErrorState({
  message = "تعذّر تحميل البيانات، تحقق من الاتصال وحاول مجددًا.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card-base flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-500">
        <AlertCircle className="h-8 w-8" />
      </span>
      <h3 className="mt-5 font-display text-lg font-extrabold text-ink-900">
        حدث خطأ ما
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-7 text-ink-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-primary mt-6 !px-6 !py-2.5 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

/** الحالة الفارغة */
export function EmptyState({
  title = "لا توجد بيانات بعد",
  message,
  calendar = false,
}: {
  title?: string;
  message?: string;
  calendar?: boolean;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-ink-50 text-ink-300">
        {calendar ? (
          <CalendarOff className="h-8 w-8" />
        ) : (
          <SearchX className="h-8 w-8" />
        )}
      </span>
      <h3 className="mt-5 font-display text-lg font-extrabold text-ink-800">
        {title}
      </h3>
      {message && (
        <p className="mt-2 max-w-sm text-sm leading-7 text-ink-500">{message}</p>
      )}
    </div>
  );
}

/** هيكل تحميل لكروت الإحصائيات */
export function StatSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-3xl bg-ink-100/70" />
      ))}
    </div>
  );
}

/** هيكل تحميل لصفوف جدول */
export function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-2xl bg-ink-100/70"
          style={{ animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  );
}

/** هيكل تحميل عام داخل بطاقة */
export function CardSkeleton({ height = "h-64" }: { height?: string }) {
  return <div className={`animate-pulse rounded-3xl bg-ink-100/70 ${height}`} />;
}
