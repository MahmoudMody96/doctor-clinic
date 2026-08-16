"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Ban,
  CalendarDays,
  Check,
  CheckCheck,
  Loader2,
  Phone,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import type { BookingDTO, BookingStatus } from "@/types";
import { formatDateAr, formatTime12, STATUS_LABELS } from "@/lib/utils";
import ServiceIcon from "@/components/ServiceIcon";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Alert, EmptyState, ErrorState, RowsSkeleton } from "@/components/admin/states";

type Filter = "ALL" | BookingStatus;

const FILTERS: Filter[] = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const FILTER_TAB_STYLE: Record<Filter, string> = {
  ALL: "bg-ink-900 text-white border-ink-900",
  PENDING: "bg-amber-500 text-white border-amber-500",
  CONFIRMED: "bg-brand-600 text-white border-brand-600",
  COMPLETED: "bg-sky-600 text-white border-sky-600",
  CANCELLED: "bg-rose-500 text-white border-rose-500",
};

/** الإجراءات السريعة المتاحة لكل حالة */
function quickActions(status: BookingStatus): {
  next: BookingStatus;
  label: string;
  icon: typeof Check;
  cls: string;
}[] {
  switch (status) {
    case "PENDING":
      return [
        { next: "CONFIRMED", label: "تأكيد الحجز", icon: Check, cls: "text-teal-600 hover:bg-teal-50 border-teal-200" },
        { next: "CANCELLED", label: "إلغاء الحجز", icon: Ban, cls: "text-rose-600 hover:bg-rose-50 border-rose-200" },
      ];
    case "CONFIRMED":
      return [
        { next: "COMPLETED", label: "إتمام الحجز", icon: CheckCheck, cls: "text-sky-600 hover:bg-sky-50 border-sky-200" },
        { next: "CANCELLED", label: "إلغاء الحجز", icon: Ban, cls: "text-rose-600 hover:bg-rose-50 border-rose-200" },
      ];
    default:
      return [];
  }
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Filter>("ALL");
  const [date, setDate] = useState("");
  const [q, setQ] = useState("");
  const [busyIds, setBusyIds] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<BookingDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async (initial = false) => {
    initial ? setLoading(true) : setRefreshing(true);
    setError("");
    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setBookings((await res.json()) as BookingDTO[]);
    } catch {
      setError("تعذّر تحميل الحجوزات من الخادم.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  // فلاتر العدّادات (عبر كل الحجوزات)
  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      ALL: bookings.length,
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const b of bookings) c[b.status] += 1;
    return c;
  }, [bookings]);

  // الفلترة الحية
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return bookings
      .filter((b) => (status === "ALL" ? true : b.status === status))
      .filter((b) => (date ? b.date === date : true))
      .filter((b) =>
        query
          ? b.patientName.toLowerCase().includes(query) ||
            b.phone.includes(query) ||
            b.refCode.toLowerCase().includes(query)
          : true
      )
      .sort((a, b) =>
        (a.date + a.time).localeCompare(b.date + b.time)
      );
  }, [bookings, status, date, q]);

  const hasFilters = status !== "ALL" || date !== "" || q.trim() !== "";

  async function updateStatus(b: BookingDTO, next: BookingStatus) {
    if (busyIds.includes(b.id)) return;
    setAlert(null);
    const prev = b.status;
    // تحديث متفائل فوري
    setBookings((list) =>
      list.map((x) => (x.id === b.id ? { ...x, status: next } : x))
    );
    setBusyIds((ids) => [...ids, b.id]);
    try {
      const res = await fetch(`/api/admin/bookings/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      setAlert({ kind: "success", text: `تم تحديث حالة حجز ${b.patientName} إلى «${STATUS_LABELS[next]}».` });
    } catch {
      // تراجع عن التحديث المتفائل
      setBookings((list) =>
        list.map((x) => (x.id === b.id ? { ...x, status: prev } : x))
      );
      setAlert({
        kind: "error",
        text: "تعذّر تحديث حالة الحجز، حاول مرة أخرى.",
      });
    } finally {
      setBusyIds((ids) => ids.filter((id) => id !== b.id));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bookings/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setBookings((list) => list.filter((x) => x.id !== deleteTarget.id));
      setAlert({ kind: "success", text: `تم حذف حجز ${deleteTarget.patientName} نهائيًا.` });
      setDeleteTarget(null);
    } catch {
      setAlert({ kind: "error", text: "تعذّر حذف الحجز، حاول مرة أخرى." });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
            إدارة الحجوزات
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            متابعة حجوزات المرضى، تحديث الحالات، وإدارة سجل العيادة الكامل.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          disabled={refreshing || loading}
          className="btn-outline !px-5 !py-2.5 text-sm disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          تحديث القائمة
        </button>
      </div>

      {alert && (
        <Alert kind={alert.kind} onClose={() => setAlert(null)}>
          {alert.text}
        </Alert>
      )}

      {/* الفلاتر */}
      <div className="card-base space-y-4 p-4 sm:p-5">
        {/* تبويبات الحالة */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatus(f)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300 ${
                status === f
                  ? FILTER_TAB_STYLE[f]
                  : "border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {f === "ALL" ? "كل الحجوزات" : STATUS_LABELS[f]}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                  status === f ? "bg-white/25" : "bg-ink-50 text-ink-500"
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* تاريخ + بحث */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative sm:w-52">
            <CalendarDays className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="تصفية بتاريخ محدد"
              className="input-base ps-11 text-sm"
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث بالاسم أو رقم الهاتف أو الكود المرجعي…"
              className="input-base ps-11 text-sm"
            />
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setStatus("ALL");
                setDate("");
                setQ("");
              }}
              className="shrink-0 rounded-full border border-ink-200 px-5 py-2.5 text-xs font-bold text-ink-500 transition hover:bg-ink-50"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* المحتوى */}
      {loading ? (
        <div className="card-base p-5">
          <RowsSkeleton rows={6} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(true)} />
      ) : filtered.length === 0 ? (
        <div className="card-base">
          <EmptyState
            title={hasFilters ? "لا نتائج مطابقة" : "لا توجد حجوزات بعد"}
            message={
              hasFilters
                ? "جرّب تعديل الفلاتر أو مسحها لعرض جميع الحجوزات."
                : "ستظهر حجوزات المرضى هنا فور استلامها."
            }
          />
        </div>
      ) : (
        <>
          {/* ═══ جدول — الشاشات المتوسطة فأكبر ═══ */}
          <div className="card-base hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-right text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/70 text-xs text-ink-500">
                    <th className="px-5 py-3.5 font-bold">الكود المرجعي</th>
                    <th className="px-5 py-3.5 font-bold">المريض</th>
                    <th className="px-5 py-3.5 font-bold">الخدمة</th>
                    <th className="px-5 py-3.5 font-bold">التاريخ</th>
                    <th className="px-5 py-3.5 font-bold">الوقت</th>
                    <th className="px-5 py-3.5 font-bold">الحالة</th>
                    <th className="px-5 py-3.5 font-bold">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const busy = busyIds.includes(b.id);
                    return (
                      <tr
                        key={b.id}
                        className={`border-b border-ink-50 transition-colors last:border-0 hover:bg-brand-50/40 ${
                          busy ? "opacity-60" : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <span
                            dir="ltr"
                            className="rounded-lg border border-ink-100 bg-ink-50 px-2.5 py-1 font-mono text-xs font-bold text-ink-700"
                          >
                            {b.refCode}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-ink-900">{b.patientName}</p>
                          <a
                            href={`tel:${b.phone}`}
                            dir="ltr"
                            className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-ink-400 transition hover:text-brand-600"
                          >
                            <Phone className="h-3 w-3" />
                            {b.phone}
                          </a>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                              <ServiceIcon name={b.service.icon} className="h-4.5 w-4.5" />
                            </span>
                            <span className="font-semibold text-ink-700">
                              {b.service.name}
                            </span>
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-ink-600">
                          {formatDateAr(b.date)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-ink-50 px-3 py-1 text-xs font-bold text-ink-700 tabular-nums">
                            {formatTime12(b.time)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {busy ? (
                              <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                            ) : (
                              <>
                                {quickActions(b.status).map((a) => (
                                  <button
                                    key={a.next}
                                    type="button"
                                    title={a.label}
                                    aria-label={a.label}
                                    onClick={() => updateStatus(b, a.next)}
                                    className={`rounded-xl border p-2 transition active:scale-90 ${a.cls}`}
                                  >
                                    <a.icon className="h-4 w-4" />
                                  </button>
                                ))}
                              </>
                            )}
                            <button
                              type="button"
                              title="حذف الحجز"
                              aria-label="حذف الحجز"
                              onClick={() => setDeleteTarget(b)}
                              className="rounded-xl border border-ink-200 p-2 text-ink-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 active:scale-90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══ كروت — الموبايل ═══ */}
          <div className="grid gap-4 md:hidden">
            {filtered.map((b, i) => {
              const busy = busyIds.includes(b.id);
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  className={`card-base p-4 ${busy ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-extrabold text-ink-900">
                        {b.patientName}
                      </h3>
                      <span
                        dir="ltr"
                        className="mt-1 inline-block rounded-lg border border-ink-100 bg-ink-50 px-2 py-0.5 font-mono text-[11px] font-bold text-ink-600"
                      >
                        {b.refCode}
                      </span>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-ink-50/70 px-3 py-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-card">
                      <ServiceIcon name={b.service.icon} className="h-4 w-4" />
                    </span>
                    <span className="truncate text-sm font-semibold text-ink-700">
                      {b.service.name}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-500">
                    <span className="font-semibold">{formatDateAr(b.date)}</span>
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 font-bold text-brand-700 tabular-nums">
                      {formatTime12(b.time)}
                    </span>
                    <a
                      href={`tel:${b.phone}`}
                      dir="ltr"
                      className="inline-flex items-center gap-1 font-bold text-ink-500 transition hover:text-brand-600"
                    >
                      <Phone className="h-3 w-3" />
                      {b.phone}
                    </a>
                  </div>

                  {b.notes && (
                    <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-800">
                      ملاحظات: {b.notes}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    {busy ? (
                      <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                    ) : (
                      quickActions(b.status).map((a) => (
                        <button
                          key={a.next}
                          type="button"
                          onClick={() => updateStatus(b, a.next)}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition active:scale-95 ${a.cls}`}
                        >
                          <a.icon className="h-3.5 w-3.5" />
                          {a.label}
                        </button>
                      ))
                    )}
                    <button
                      type="button"
                      aria-label="حذف الحجز"
                      onClick={() => setDeleteTarget(b)}
                      className="rounded-xl border border-ink-200 p-2 text-ink-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 active:scale-90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-xs text-ink-400">
            يتم عرض {filtered.length} من أصل {bookings.length} حجز
          </p>
        </>
      )}

      {/* نافذة تأكيد الحذف */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={deleting}
        title="حذف الحجز نهائيًا"
        confirmLabel="نعم، حذف نهائي"
        message={
          deleteTarget
            ? `سيتم حذف حجز المريض «${deleteTarget.patientName}» (الكود ${deleteTarget.refCode}) نهائيًا ولا يمكن التراجع عن ذلك. هل أنت متأكد؟`
            : ""
        }
      />
    </div>
  );
}
