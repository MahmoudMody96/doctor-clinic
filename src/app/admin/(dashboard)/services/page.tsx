"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Tag,
  Trash2,
} from "lucide-react";
import type { ServiceDTO } from "@/types";
import { formatPrice } from "@/lib/utils";
import ServiceIcon, { SERVICE_ICON_NAMES } from "@/components/ServiceIcon";
import Toggle from "@/components/admin/Toggle";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Alert, CardSkeleton, EmptyState, ErrorState } from "@/components/admin/states";

type FormState = {
  name: string;
  description: string;
  price: string;
  durationMin: string;
  icon: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  durationMin: "30",
  icon: "Stethoscope",
  sortOrder: "10",
  isActive: true,
};

const ICON_LABELS: Record<string, string> = {
  Sparkles: "لمعان (تبييض)",
  Sun: "شمس",
  CircleDot: "نقطة",
  Activity: "نشاط",
  Crown: "تاج (تركايب فاخرة)",
  Smile: "ابتسامة",
  Plus: "إضافة",
  Baby: "أطفال",
  Stethoscope: "سماعة طبيب",
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // مودال الإضافة/التعديل
  const [editing, setEditing] = useState<{ mode: "add" } | { mode: "edit"; service: ServiceDTO } | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // الحذف وعرض 409
  const [deleteTarget, setDeleteTarget] = useState<ServiceDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [disableOffer, setDisableOffer] = useState<{ service: ServiceDTO; message: string } | null>(null);
  const [disabling, setDisabling] = useState(false);
  const [toggleBusy, setToggleBusy] = useState<number[]>([]);

  const load = useCallback(async (initial = false) => {
    initial ? setLoading(true) : setRefreshing(true);
    setError("");
    try {
      const res = await fetch("/api/admin/services", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setServices((await res.json()) as ServiceDTO[]);
    } catch {
      setError("تعذّر تحميل الخدمات من الخادم.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditing({ mode: "add" });
  }

  function openEdit(s: ServiceDTO) {
    setForm({
      name: s.name,
      description: s.description,
      price: String(s.price),
      durationMin: String(s.durationMin),
      icon: s.icon,
      sortOrder: String(s.sortOrder),
      isActive: s.isActive,
    });
    setFormErrors({});
    setEditing({ mode: "edit", service: s });
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "اسم الخدمة مطلوب.";
    const price = Number(form.price);
    if (form.price === "" || isNaN(price) || price < 0)
      errs.price = "أدخل سعرًا صحيحًا (0 فأكثر).";
    const dur = Number(form.durationMin);
    if (form.durationMin === "" || isNaN(dur) || dur <= 0)
      errs.durationMin = "أدخل مدة صحيحة بالدقائق.";
    const order = Number(form.sortOrder);
    if (form.sortOrder === "" || isNaN(order)) errs.sortOrder = "أدخل رقم ترتيب صحيحًا.";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSaveModal() {
    if (!editing || saving) return;
    setAlert(null);
    if (!validateForm()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      durationMin: Number(form.durationMin),
      icon: form.icon,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    };
    try {
      const res =
        editing.mode === "add"
          ? await fetch("/api/admin/services", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/services/${editing.service.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setFormErrors({
          name: data.error || "تعذّر حفظ الخدمة، راجع البيانات وحاول مجددًا.",
        });
        return;
      }
      setAlert({
        kind: "success",
        text:
          editing.mode === "add"
            ? `تمت إضافة خدمة «${payload.name}» بنجاح.`
            : `تم تحديث خدمة «${payload.name}» بنجاح.`,
      });
      setEditing(null);
      await load();
    } catch {
      setFormErrors({ name: "تعذّر الاتصال بالخادم، حاول مرة أخرى." });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(s: ServiceDTO) {
    if (toggleBusy.includes(s.id)) return;
    setAlert(null);
    const next = !s.isActive;
    // تحديث متفائل
    setServices((list) =>
      list.map((x) => (x.id === s.id ? { ...x, isActive: next } : x))
    );
    setToggleBusy((ids) => [...ids, s.id]);
    try {
      const res = await fetch(`/api/admin/services/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) throw new Error();
      setAlert({
        kind: "success",
        text: next
          ? `تم تفعيل خدمة «${s.name}» — أصبحت متاحة للحجز.`
          : `تم تعطيل خدمة «${s.name}» — لن تظهر في صفحة الحجز.`,
      });
    } catch {
      setServices((list) =>
        list.map((x) => (x.id === s.id ? { ...x, isActive: s.isActive } : x))
      );
      setAlert({ kind: "error", text: "تعذّر تغيير حالة الخدمة، حاول مرة أخرى." });
    } finally {
      setToggleBusy((ids) => ids.filter((id) => id !== s.id));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.status === 409) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setDeleteTarget(null);
        setDisableOffer({
          service: deleteTarget,
          message:
            data.error ||
            "لا يمكن حذف الخدمة لوجود حجوزات مرتبطة بها. يمكنك تعطيلها بدلًا من ذلك لإخفائها من الحجز الجديد مع الاحتفاظ بالسجلات.",
        });
        return;
      }
      if (!res.ok) throw new Error();
      setServices((list) => list.filter((x) => x.id !== deleteTarget.id));
      setAlert({ kind: "success", text: `تم حذف خدمة «${deleteTarget.name}» نهائيًا.` });
      setDeleteTarget(null);
    } catch {
      setAlert({ kind: "error", text: "تعذّر حذف الخدمة، حاول مرة أخرى." });
    } finally {
      setDeleting(false);
    }
  }

  async function handleDisableOffer() {
    if (!disableOffer) return;
    setDisabling(true);
    try {
      const res = await fetch(`/api/admin/services/${disableOffer.service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      if (!res.ok) throw new Error();
      setServices((list) =>
        list.map((x) =>
          x.id === disableOffer.service.id ? { ...x, isActive: false } : x
        )
      );
      setAlert({
        kind: "success",
        text: `تم تعطيل خدمة «${disableOffer.service.name}» بدلًا من حذفها.`,
      });
      setDisableOffer(null);
    } catch {
      setAlert({ kind: "error", text: "تعذّر تعطيل الخدمة، حاول مرة أخرى." });
    } finally {
      setDisabling(false);
    }
  }

  const activeCount = services.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
            إدارة الخدمات
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {services.length > 0
              ? `${activeCount} خدمة مفعلة من أصل ${services.length} — الأسعار والمدد تظهر مباشرة في صفحة الحجز.`
              : "أضف خدمات العيادة لتظهر في صفحة الحجز."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => load()}
            disabled={refreshing || loading}
            className="btn-outline !px-5 !py-2.5 text-sm disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            تحديث
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="btn-primary !px-5 !py-2.5 text-sm"
          >
            <Plus className="h-4 w-4" />
            إضافة خدمة
          </button>
        </div>
      </div>

      {alert && (
        <Alert kind={alert.kind} onClose={() => setAlert(null)}>
          {alert.text}
        </Alert>
      )}

      {/* المحتوى */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} height="h-56" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(true)} />
      ) : services.length === 0 ? (
        <div className="card-base">
          <EmptyState
            title="لا توجد خدمات بعد"
            message="ابدأ بإضافة أول خدمة لتظهر في صفحة حجز المواعيد."
          />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s, i) => {
            const busy = toggleBusy.includes(s.id);
            return (
              <motion.article
                key={s.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.4), duration: 0.4 }}
                className={`card-base group relative flex flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft ${
                  !s.isActive ? "opacity-70" : ""
                } ${busy ? "opacity-50" : ""}`}
              >
                {!s.isActive && (
                  <span className="absolute end-4 top-4 rounded-full border border-ink-200 bg-ink-50 px-2.5 py-0.5 text-[10px] font-bold text-ink-400">
                    معطلة
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                      s.isActive
                        ? "bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600"
                        : "bg-ink-50 text-ink-300"
                    }`}
                  >
                    <ServiceIcon name={s.icon} className="h-7 w-7" />
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <h3 className="truncate font-display text-base font-extrabold text-ink-900">
                      {s.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-6 text-ink-400">
                      {s.description || "بدون وصف"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-ink-50/80 p-3 text-center">
                  <div>
                    <p className="font-display text-sm font-extrabold text-brand-700 tabular-nums">
                      {formatPrice(s.price)}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold text-ink-400">السعر</p>
                  </div>
                  <div className="border-x border-ink-100">
                    <p className="font-display text-sm font-extrabold text-ink-700 tabular-nums">
                      {s.durationMin} د
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold text-ink-400">المدة</p>
                  </div>
                  <div>
                    <p className="font-display text-sm font-extrabold text-ink-700 tabular-nums">
                      {s.sortOrder}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold text-ink-400">الترتيب</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-ink-50 pt-4">
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={s.isActive}
                      onChange={() => toggleActive(s)}
                      disabled={busy}
                      label={`تفعيل خدمة ${s.name}`}
                    />
                    <span className="text-xs font-bold text-ink-500">
                      {s.isActive ? "مفعلة" : "معطلة"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      aria-label={`تعديل خدمة ${s.name}`}
                      title="تعديل"
                      className="rounded-xl border border-ink-200 p-2 text-ink-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-90"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(s)}
                      aria-label={`حذف خدمة ${s.name}`}
                      title="حذف"
                      className="rounded-xl border border-ink-200 p-2 text-ink-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 active:scale-90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* مودال الإضافة/التعديل */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.mode === "add" ? "إضافة خدمة جديدة" : "تعديل الخدمة"}
        subtitle={
          editing?.mode === "add"
            ? "ستظهر الخدمة في صفحة الحجز فور تفعيلها."
            : editing?.service.name
        }
        maxWidth="max-w-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label-base">اسم الخدمة</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: تبييض الأسنان بالليزر"
              className="input-base"
            />
            {formErrors.name && (
              <p className="mt-1.5 text-xs font-bold text-rose-600">{formErrors.name}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="label-base">الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="وصف مختصر يظهر للمرضى في صفحة الخدمات…"
              rows={3}
              className="input-base resize-none leading-7"
            />
          </div>

          <div>
            <label className="label-base">السعر (ج.م)</label>
            <input
              type="number"
              dir="ltr"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input-base tabular-nums"
            />
            {formErrors.price && (
              <p className="mt-1.5 text-xs font-bold text-rose-600">{formErrors.price}</p>
            )}
          </div>

          <div>
            <label className="label-base">المدة (بالدقائق)</label>
            <input
              type="number"
              dir="ltr"
              min={5}
              step={5}
              value={form.durationMin}
              onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
              className="input-base tabular-nums"
            />
            {formErrors.durationMin && (
              <p className="mt-1.5 text-xs font-bold text-rose-600">{formErrors.durationMin}</p>
            )}
          </div>

          <div>
            <label className="label-base">الأيقونة</label>
            <div className="relative">
              <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-brand-600">
                <ServiceIcon name={form.icon} className="h-4.5 w-4.5" />
              </span>
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="input-base appearance-none ps-12"
              >
                {SERVICE_ICON_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {ICON_LABELS[name] ?? name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-base">ترتيب الظهور</label>
            <input
              type="number"
              dir="ltr"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className="input-base tabular-nums"
            />
            {formErrors.sortOrder && (
              <p className="mt-1.5 text-xs font-bold text-rose-600">{formErrors.sortOrder}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-ink-100 bg-ink-50/60 px-4 py-3 sm:col-span-2">
            <span className="flex items-center gap-2 text-sm font-bold text-ink-700">
              <Tag className="h-4 w-4 text-brand-600" />
              خدمة مفعلة (متاحة للحجز)
            </span>
            <Toggle
              checked={form.isActive}
              onChange={(v) => setForm({ ...form, isActive: v })}
              label="تفعيل الخدمة"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-ink-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setEditing(null)}
            disabled={saving}
            className="btn-outline !px-6 !py-2.5 text-sm !text-ink-600 !border-ink-200 hover:!bg-ink-50 disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSaveModal}
            disabled={saving}
            className="btn-primary !px-6 !py-2.5 text-sm disabled:opacity-70"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {editing?.mode === "add" ? "إضافة الخدمة" : "حفظ التعديلات"}
          </button>
        </div>
      </Modal>

      {/* تأكيد الحذف */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={deleting}
        title="حذف الخدمة"
        confirmLabel="نعم، حذف الخدمة"
        message={
          deleteTarget
            ? `سيتم حذف خدمة «${deleteTarget.name}» نهائيًا. يُفضّل تعطيلها بدلًا من الحذف إن كانت مرتبطة بحجوزات سابقة. هل تريد المتابعة؟`
            : ""
        }
      />

      {/* عرض 409: تعطيل بدلًا من الحذف */}
      <ConfirmDialog
        open={disableOffer !== null}
        onClose={() => setDisableOffer(null)}
        onConfirm={handleDisableOffer}
        busy={disabling}
        danger={false}
        title="لا يمكن حذف الخدمة"
        confirmLabel="تعطيل بدلًا من الحذف"
        message={disableOffer?.message ?? ""}
      />
    </div>
  );
}
