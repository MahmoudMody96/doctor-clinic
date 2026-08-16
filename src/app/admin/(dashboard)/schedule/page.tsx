"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarPlus,
  Clock,
  Coffee,
  Loader2,
  MoonStar,
  Save,
  Trash2,
} from "lucide-react";
import type { BlockedDateDTO, ScheduleRuleDTO } from "@/types";
import { DAY_NAMES_AR, formatDateAr, timeToMinutes, todayCairo } from "@/lib/utils";
import Toggle from "@/components/admin/Toggle";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Alert, CardSkeleton, EmptyState, ErrorState } from "@/components/admin/states";

type RuleErrors = Record<number, string>;

export default function AdminSchedulePage() {
  const [rules, setRules] = useState<ScheduleRuleDTO[]>([]);
  const [blocked, setBlocked] = useState<BlockedDateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [ruleErrors, setRuleErrors] = useState<RuleErrors>({});
  const [alert, setAlert] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [addingBlocked, setAddingBlocked] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlockedDateDTO | null>(null);
  const [deletingBlocked, setDeletingBlocked] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/schedule", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as {
        rules: ScheduleRuleDTO[];
        blocked: BlockedDateDTO[];
      };
      setRules([...data.rules].sort((a, b) => a.dayOfWeek - b.dayOfWeek));
      setBlocked(data.blocked);
    } catch {
      setError("تعذّر تحميل مواعيد العمل من الخادم.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = todayCairo();

  const sortedBlocked = useMemo(
    () => [...blocked].sort((a, b) => a.date.localeCompare(b.date)),
    [blocked]
  );

  function updateRule(dayOfWeek: number, patch: Partial<ScheduleRuleDTO>) {
    setRules((list) =>
      list.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r))
    );
  }

  /** تحقق منطقي قبل الحفظ — رسائل عربية */
  function validate(): boolean {
    const errs: RuleErrors = {};
    for (const r of rules) {
      const day = DAY_NAMES_AR[r.dayOfWeek];
      if (!r.startTime || !r.endTime) {
        errs[r.dayOfWeek] = `يوم ${day}: يجب إدخال وقت البدء ووقت الانتهاء.`;
        continue;
      }
      if (timeToMinutes(r.startTime) >= timeToMinutes(r.endTime)) {
        errs[r.dayOfWeek] = `يوم ${day}: يجب أن يكون وقت البدء قبل وقت الانتهاء.`;
        continue;
      }
      const hasBreakStart = !!r.breakStart;
      const hasBreakEnd = !!r.breakEnd;
      if (hasBreakStart !== hasBreakEnd) {
        errs[r.dayOfWeek] = `يوم ${day}: أدخل وقتي بداية ونهاية فترة الراحة معًا أو اتركهما فارغين.`;
        continue;
      }
      if (hasBreakStart && hasBreakEnd && r.breakStart && r.breakEnd) {
        if (timeToMinutes(r.breakStart) >= timeToMinutes(r.breakEnd)) {
          errs[r.dayOfWeek] = `يوم ${day}: بداية فترة الراحة يجب أن تسبق نهايتها.`;
          continue;
        }
        if (
          timeToMinutes(r.breakStart) < timeToMinutes(r.startTime) ||
          timeToMinutes(r.breakEnd) > timeToMinutes(r.endTime)
        ) {
          errs[r.dayOfWeek] = `يوم ${day}: فترة الراحة يجب أن تقع داخل ساعات العمل.`;
          continue;
        }
      }
    }
    setRuleErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSaveRules() {
    if (saving) return;
    setAlert(null);
    if (!validate()) {
      setAlert({
        kind: "error",
        text: "يوجد أخطاء في جدول المواعيد — راجع الرسائل بجانب الأيام المطلوبة.",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rules: rules.map((r) => ({
            dayOfWeek: r.dayOfWeek,
            startTime: r.startTime,
            endTime: r.endTime,
            breakStart: r.breakStart || null,
            breakEnd: r.breakEnd || null,
            isActive: r.isActive,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { rules: ScheduleRuleDTO[] };
      setRules([...data.rules].sort((a, b) => a.dayOfWeek - b.dayOfWeek));
      setAlert({ kind: "success", text: "تم حفظ جدول مواعيد الأسبوع بنجاح." });
    } catch {
      setAlert({ kind: "error", text: "تعذّر حفظ الجدول، حاول مرة أخرى." });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddBlocked() {
    if (!newDate || addingBlocked) return;
    setAlert(null);
    setAddingBlocked(true);
    try {
      const res = await fetch("/api/admin/schedule/blocked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, reason: newReason || undefined }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setAlert({
          kind: "error",
          text: data.error || "تعذّر إضافة التاريخ المغلق.",
        });
        return;
      }
      const item = (await res.json()) as BlockedDateDTO;
      setBlocked((list) => [...list, item]);
      setNewDate("");
      setNewReason("");
      setAlert({ kind: "success", text: "تم إغلاق التاريخ بنجاح — لن يظهر لأي حجز جديد." });
    } catch {
      setAlert({ kind: "error", text: "تعذّر الاتصال بالخادم، حاول مرة أخرى." });
    } finally {
      setAddingBlocked(false);
    }
  }

  async function handleDeleteBlocked() {
    if (!deleteTarget) return;
    setDeletingBlocked(true);
    try {
      const res = await fetch(
        `/api/admin/schedule/blocked/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      setBlocked((list) => list.filter((x) => x.id !== deleteTarget.id));
      setAlert({ kind: "success", text: "تم حذف التاريخ المغلق وأصبح متاحًا للحجز." });
      setDeleteTarget(null);
    } catch {
      setAlert({ kind: "error", text: "تعذّر حذف التاريخ المغلق، حاول مرة أخرى." });
    } finally {
      setDeletingBlocked(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton height="h-[28rem]" />
        <CardSkeleton height="h-72" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div className="space-y-7">
      {/* رأس الصفحة */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
          مواعيد العمل
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          حدّد أيام وساعات عمل العيادة وفترات الراحة — تنطبق فورًا على نظام الحجز.
        </p>
      </div>

      {alert && (
        <Alert kind={alert.kind} onClose={() => setAlert(null)}>
          {alert.text}
        </Alert>
      )}

      {/* ═══ جدول الأسبوع ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-base overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-lg font-extrabold text-ink-900">
              جدول الأسبوع
            </h2>
            <p className="mt-0.5 text-xs text-ink-400">
              عطّل أي يوم لا تعمل فيه — تُحفظ الأوقات كما هي للاستخدام لاحقًا
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveRules}
            disabled={saving}
            className="btn-primary !px-6 !py-2.5 text-sm disabled:opacity-70"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            حفظ الجدول
          </button>
        </div>

        {/* رأس الأعمدة */}
        <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-ink-100 bg-ink-50/70 px-6 py-3 text-xs font-bold text-ink-500 lg:grid">
          <span>اليوم</span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> بداية العمل
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> نهاية العمل
          </span>
          <span className="flex items-center gap-1.5">
            <Coffee className="h-3.5 w-3.5" /> بداية الراحة
          </span>
          <span className="flex items-center gap-1.5">
            <Coffee className="h-3.5 w-3.5" /> نهاية الراحة
          </span>
        </div>

        <div className="divide-y divide-ink-50">
          {rules.map((r, i) => {
            const err = ruleErrors[r.dayOfWeek];
            const dimmed = !r.isActive;
            return (
              <motion.div
                key={r.dayOfWeek}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className={`px-5 py-4 transition-opacity sm:px-6 ${
                  dimmed ? "opacity-55" : ""
                } ${err ? "bg-rose-50/50" : ""}`}
              >
                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr] lg:items-center">
                  {/* اليوم + السويتش */}
                  <div className="flex items-center justify-between gap-3 lg:justify-start">
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl font-display text-sm font-extrabold ${
                          r.dayOfWeek === new Date().getDay()
                            ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow"
                            : "bg-ink-50 text-ink-600"
                        }`}
                      >
                        {DAY_NAMES_AR[r.dayOfWeek].slice(0, 3)}
                      </span>
                      <span className="font-bold text-ink-800">
                        {DAY_NAMES_AR[r.dayOfWeek]}
                        {r.dayOfWeek === new Date().getDay() && (
                          <span className="ms-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                            اليوم
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 lg:hidden">
                      <span className="text-xs font-bold text-ink-400">
                        {r.isActive ? "مفتوح" : "مغلق"}
                      </span>
                      <Toggle
                        checked={r.isActive}
                        onChange={(v) => updateRule(r.dayOfWeek, { isActive: v })}
                        label={`تفعيل يوم ${DAY_NAMES_AR[r.dayOfWeek]}`}
                      />
                    </span>
                    <span className="hidden lg:inline">
                      <Toggle
                        checked={r.isActive}
                        onChange={(v) => updateRule(r.dayOfWeek, { isActive: v })}
                        label={`تفعيل يوم ${DAY_NAMES_AR[r.dayOfWeek]}`}
                      />
                    </span>
                  </div>

                  {/* الحقول */}
                  {(
                    [
                      ["startTime", "وقت البدء"],
                      ["endTime", "وقت الانتهاء"],
                      ["breakStart", "بداية الراحة (اختياري)"],
                      ["breakEnd", "نهاية الراحة (اختياري)"],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field} className="lg:min-w-0">
                      <label className="mb-1.5 block text-[11px] font-bold text-ink-400 lg:hidden">
                        {label}
                      </label>
                      <input
                        type="time"
                        dir="ltr"
                        value={r[field] ?? ""}
                        onChange={(e) =>
                          updateRule(r.dayOfWeek, {
                            [field]: field.startsWith("break")
                              ? e.target.value || null
                              : e.target.value,
                          } as Partial<ScheduleRuleDTO>)
                        }
                        className="input-base !px-3 !py-2 text-sm tabular-nums"
                      />
                    </div>
                  ))}
                </div>

                {err && (
                  <p className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-rose-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    {err}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-start gap-3 border-t border-ink-100 bg-ink-50/50 px-5 py-4 text-xs leading-6 text-ink-500 sm:px-6">
          <MoonStar className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
          اترك حقول فترة الراحة فارغة لتعطيلها — تُستثنى فترة الراحة تلقائيًا من
          المواعيد المتاحة للحجز في نفس اليوم.
        </div>
      </motion.section>

      {/* ═══ التواريخ المغلقة ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="card-base overflow-hidden"
      >
        <div className="border-b border-ink-100 px-5 py-4 sm:px-6">
          <h2 className="font-display text-lg font-extrabold text-ink-900">
            التواريخ المغلقة (إجازات وأعياد)
          </h2>
          <p className="mt-0.5 text-xs text-ink-400">
            أغلق تواريخ محددة مثل الإجازات الرسمية — الأقرب أولًا
          </p>
        </div>

        {/* فورم الإضافة */}
        <div className="flex flex-col gap-3 border-b border-ink-100 bg-ink-50/50 px-5 py-4 sm:flex-row sm:items-end sm:px-6">
          <div className="sm:w-56">
            <label className="label-base !mb-1.5 text-xs">التاريخ</label>
            <input
              type="date"
              dir="ltr"
              value={newDate}
              min={today}
              onChange={(e) => setNewDate(e.target.value)}
              className="input-base !py-2.5 text-sm tabular-nums"
            />
          </div>
          <div className="flex-1">
            <label className="label-base !mb-1.5 text-xs">
              السبب (اختياري)
            </label>
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="مثال: إجازة عيد الأضحى"
              className="input-base !py-2.5 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleAddBlocked}
            disabled={!newDate || addingBlocked}
            className="btn-primary shrink-0 !px-6 !py-2.5 text-sm disabled:opacity-60"
          >
            {addingBlocked ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarPlus className="h-4 w-4" />
            )}
            إغلاق التاريخ
          </button>
        </div>

        {/* القائمة */}
        {sortedBlocked.length === 0 ? (
          <EmptyState
            title="لا توجد تواريخ مغلقة"
            message="أضف تواريخ الإجازات والأعياد لمنع الحجز فيها."
            calendar
          />
        ) : (
          <ul className="divide-y divide-ink-50">
            {sortedBlocked.map((b) => {
              const isPast = b.date < today;
              return (
                <li
                  key={b.id}
                  className={`flex flex-wrap items-center gap-3 px-5 py-3.5 transition hover:bg-brand-50/40 sm:px-6 ${
                    isPast ? "opacity-55" : ""
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-2xl border text-center leading-none ${
                      isPast
                        ? "border-ink-100 bg-ink-50 text-ink-400"
                        : "border-rose-200 bg-rose-50 text-rose-600"
                    }`}
                  >
                    <span className="font-display text-sm font-extrabold tabular-nums">
                      {b.date.slice(8, 10)}
                    </span>
                    <span className="mt-0.5 text-[9px] font-bold">
                      {b.date.slice(5, 7)}/{b.date.slice(2, 4)}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink-800">
                      {formatDateAr(b.date)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-400">
                      {b.reason || "بدون سبب محدد"}
                    </p>
                  </div>
                  {isPast ? (
                    <span className="rounded-full border border-ink-200 bg-white px-3 py-1 text-[11px] font-bold text-ink-400">
                      منتهي
                    </span>
                  ) : (
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-600">
                      مغلق للحجز
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(b)}
                    aria-label="حذف التاريخ المغلق"
                    title="حذف التاريخ المغلق"
                    className="rounded-xl border border-ink-200 p-2 text-ink-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 active:scale-90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </motion.section>

      {/* تأكيد حذف تاريخ مغلق */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteBlocked}
        busy={deletingBlocked}
        title="حذف التاريخ المغلق"
        confirmLabel="نعم، إتاحة التاريخ"
        message={
          deleteTarget
            ? `سيصبح تاريخ ${formatDateAr(deleteTarget.date)} متاحًا للحجز مرة أخرى. هل تريد المتابعة؟`
            : ""
        }
      />
    </div>
  );
}
