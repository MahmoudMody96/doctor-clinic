"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Info,
  Loader2,
  Phone,
  Save,
  Share2,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import type { ContentMap } from "@/types";
import { Alert, CardSkeleton, ErrorState } from "@/components/admin/states";

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "number";
  ltr?: boolean;
  hint?: string;
};

type SectionDef = {
  title: string;
  description: string;
  icon: LucideIcon;
  fields: FieldDef[];
};

const SECTIONS: SectionDef[] = [
  {
    title: "بيانات الطبيب والواجهة الرئيسية",
    description: "تظهر هذه البيانات في ترحيب الموقع وأقسام «من أنا» والإحصائيات.",
    icon: Stethoscope,
    fields: [
      { key: "doctor_name", label: "اسم الطبيب", placeholder: "د. أحمد الشريف" },
      { key: "doctor_title", label: "المسمى الوظيفي", placeholder: "استشاري طب وتجميل الأسنان" },
      { key: "hero_badge", label: "الشارة أعلى العنوان الرئيسي", placeholder: "عيادة متكاملة لطب وتجميل الأسنان" },
      { key: "hero_title", label: "العنوان الرئيسي بالواجهة", placeholder: "ابتسامتك تستحق الأفضل" },
      { key: "hero_subtitle", label: "العنوان الفرعي بالواجهة", type: "textarea", placeholder: "جملة تعريفية قصيرة تظهر تحت العنوان الرئيسي…" },
      { key: "about_short", label: "نبذة مختصرة عن الطبيب", type: "textarea", placeholder: "تظهر في قسم «من أنا» بالصفحة الرئيسية…" },
      { key: "experience_years", label: "سنوات الخبرة", type: "number", placeholder: "15" },
      { key: "patients_count", label: "عدد المرضى (سنة)", type: "number", hint: "رقم يظهر في عداد الإحصائيات" },
      { key: "reviews_count", label: "عدد التقييمات", type: "number" },
      { key: "rating", label: "التقييم العام (من 5)", type: "number", hint: "مثال: 4.9" },
    ],
  },
  {
    title: "بيانات التواصل",
    description: "تُستخدم في أزرار الاتصال والواتساب وخرائط الوصول للعيادة.",
    icon: Phone,
    fields: [
      { key: "phone", label: "رقم الهاتف", ltr: true, placeholder: "01xxxxxxxxx" },
      { key: "whatsapp", label: "رقم الواتساب", ltr: true, hint: "بالصيغة الدولية بدون +، مثال: 201234567890" },
      { key: "email", label: "البريد الإلكتروني", ltr: true, placeholder: "info@clinic.com" },
      { key: "address", label: "عنوان العيادة", placeholder: "٢٢ شارع النيل، المعادي، القاهرة" },
      { key: "map_url", label: "رابط موقع الخريطة", ltr: true, hint: "رابط Google Maps للموقع" },
      { key: "working_hours_text", label: "نص مواعيد العمل", type: "textarea", placeholder: "السبت – الخميس: ١٠ صباحًا – ٨ مساءً" },
    ],
  },
  {
    title: "حسابات التواصل الاجتماعي",
    description: "روابط الحسابات الرسمية للعيادة التي تظهر في التذييل.",
    icon: Share2,
    fields: [
      { key: "instagram", label: "رابط إنستغرام", ltr: true, placeholder: "https://instagram.com/…" },
      { key: "facebook", label: "رابط فيسبوك", ltr: true, placeholder: "https://facebook.com/…" },
    ],
  },
];

const MANAGED_KEYS = SECTIONS.flatMap((s) => s.fields.map((f) => f.key));

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/content", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as ContentMap;
      setContent(data);
      setSaved(data);
    } catch {
      setError("تعذّر تحميل محتوى الموقع من الخادم.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // نسخة آخر حفظ ناجح — للمقارنة وتفعيل زر الحفظ
  const [saved, setSaved] = useState<ContentMap>({});

  const hasChanges = useMemo(
    () => MANAGED_KEYS.some((k) => (content[k] ?? "") !== (saved[k] ?? "")),
    [content, saved]
  );

  async function handleSave() {
    if (saving) return;
    setAlert(null);
    setSaving(true);
    try {
      const payload: ContentMap = {};
      for (const key of MANAGED_KEYS) payload[key] = content[key] ?? "";
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSaved({ ...content });
      setAlert({
        kind: "success",
        text: "تم حفظ المحتوى بنجاح — التعديلات ظاهرة الآن في الصفحة الرئيسية للموقع.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setAlert({ kind: "error", text: "تعذّر حفظ المحتوى، حاول مرة أخرى." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton height="h-96" />
        <CardSkeleton height="h-72" />
        <CardSkeleton height="h-44" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
            محتوى الموقع
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            عدّل نصوص وبيانات الصفحة الرئيسية — تُحدَّث فور الحفظ لجميع الزوار.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="btn-primary !px-7 !py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "جارٍ الحفظ…" : "حفظ كل التغييرات"}
        </button>
      </div>

      {alert && (
        <Alert kind={alert.kind} onClose={() => setAlert(null)}>
          {alert.text}
        </Alert>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50/70 px-5 py-4 text-xs leading-6 text-brand-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        اضغط «حفظ كل التغييرات» أسفل الصفحة أو أعلاها بعد التعديل — الزر يبقى
        معطلًا حتى وجود تغيير فعلي.
      </div>

      {SECTIONS.map((section, si) => (
        <motion.section
          key={section.title}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.1, duration: 0.5 }}
          className="card-base overflow-hidden"
        >
          <div className="flex items-center gap-4 border-b border-ink-100 px-5 py-4 sm:px-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700">
              <section.icon className="h-5.5 w-5.5" />
            </span>
            <div>
              <h2 className="font-display text-base font-extrabold text-ink-900">
                {section.title}
              </h2>
              <p className="mt-0.5 text-xs text-ink-400">{section.description}</p>
            </div>
          </div>

          <div className="grid gap-x-5 gap-y-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
            {section.fields.map((f) => (
              <div
                key={f.key}
                className={f.type === "textarea" ? "sm:col-span-2" : ""}
              >
                <label htmlFor={`f-${f.key}`} className="label-base">
                  {f.label}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    id={`f-${f.key}`}
                    value={content[f.key] ?? ""}
                    onChange={(e) =>
                      setContent({ ...content, [f.key]: e.target.value })
                    }
                    placeholder={f.placeholder}
                    rows={3}
                    className="input-base resize-none leading-7"
                  />
                ) : (
                  <input
                    id={`f-${f.key}`}
                    type={f.type === "number" ? "text" : "text"}
                    inputMode={f.type === "number" ? "decimal" : undefined}
                    dir={f.ltr ? "ltr" : undefined}
                    value={content[f.key] ?? ""}
                    onChange={(e) =>
                      setContent({ ...content, [f.key]: e.target.value })
                    }
                    placeholder={f.placeholder}
                    className={`input-base ${f.ltr ? "text-left" : ""} ${
                      f.type === "number" ? "tabular-nums" : ""
                    }`}
                  />
                )}
                {f.hint && (
                  <p className="mt-1.5 text-[11px] text-ink-400">{f.hint}</p>
                )}
              </div>
            ))}
          </div>
        </motion.section>
      ))}

      {/* زر حفظ سفلي ثابت المظهر */}
      <div className="card-base flex flex-col items-center justify-between gap-4 px-6 py-5 sm:flex-row">
        <p className="flex items-center gap-2 text-xs text-ink-500">
          <Globe className="h-4 w-4 text-brand-500" />
          {hasChanges
            ? "لديك تغييرات غير محفوظة — لا تنسَ الحفظ قبل مغادرة الصفحة."
            : "كل البيانات محفوظة ومحدثة في الصفحة الرئيسية."}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="btn-primary w-full !px-7 !py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "جارٍ الحفظ…" : "حفظ كل التغييرات"}
        </button>
      </div>
    </div>
  );
}
