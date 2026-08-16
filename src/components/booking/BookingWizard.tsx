"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Loader2,
} from "lucide-react";
import type { ServiceDTO } from "@/types";
import { isValidEgyptianPhone, normalizeDigits } from "@/lib/utils";
import BookingToast, { type ToastData, type ToastType } from "./Toast";
import Stepper from "./Stepper";
import StepService from "./StepService";
import StepDate from "./StepDate";
import StepTime from "./StepTime";
import StepDetails from "./StepDetails";
import StepConfirm from "./StepConfirm";
import SuccessScreen from "./SuccessScreen";
import {
  toArabicDigits,
  type AvailabilityData,
  type AvailabilityState,
  type BookingFormState,
  type BookingResult,
} from "./helpers";

const STEP_COUNT = 5;

/** حركة الانتقال بين الخطوات — انزلاق وتلاشٍ باتجاه التنقل (RTL) */
const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -56 : 56 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 56 : -56 }),
};

const NAV_BACK =
  "inline-flex items-center gap-2 rounded-full border-2 border-ink-200 bg-white px-6 py-2.5 text-sm font-extrabold text-ink-700 transition-all duration-300 hover:border-brand-400 hover:text-brand-700";

const NAV_NEXT =
  "inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-brand-800 to-brand-700 px-8 py-3 text-sm font-extrabold text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:brightness-100";

/** المعالج الرئيسي — إدارة الحالة والتنقل وجلب البيانات عبر الخطوات الخمس */
export default function BookingWizard({
  whatsapp,
  offDays,
  address,
  mapUrl,
}: {
  whatsapp: string;
  offDays: number[];
  address: string;
  mapUrl: string;
}) {
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // الخدمات
  const [services, setServices] = useState<ServiceDTO[] | null>(null);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // الاختيارات
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityState>({
    status: "idle",
  });
  const [availabilityTick, setAvailabilityTick] = useState(0);

  // بيانات المريض
  const [form, setForm] = useState<BookingFormState>({
    name: "",
    phone: "",
    notes: "",
  });
  const [touched, setTouched] = useState({ name: false, phone: false });

  // الإرسال
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  // تنبيهات
  const [toast, setToast] = useState<ToastData | null>(null);

  const topRef = useRef<HTMLDivElement | null>(null);
  const skipFirstScroll = useRef(true);
  const deepLinkHandled = useRef(false);
  const draftRestored = useRef(false);

  const selectedService = useMemo(
    () => services?.find((s) => s.id === serviceId) ?? null,
    [services, serviceId]
  );

  /* ───────── أدوات ───────── */

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ id: Date.now() + Math.random(), type, message });
  }, []);

  const refreshAvailability = useCallback(() => {
    setAvailabilityTick((t) => t + 1);
  }, []);

  /* ───────── جلب الخدمات ───────── */

  const loadServices = useCallback(async () => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const res = await fetch("/api/services", { cache: "no-store" });
      if (!res.ok) throw new Error("bad status");
      const data = (await res.json()) as ServiceDTO[];
      setServices(data);
    } catch {
      setServicesError(
        "تعذر تحميل قائمة الخدمات — تحقق من اتصالك بالإنترنت ثم أعد المحاولة."
      );
    } finally {
      setServicesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  /* ───────── حفظ مسودة الحجز واسترجاعها ───────── */

  const DRAFT_KEY = "booking-draft";

  // حفظ الاختيارات والبيانات أولًا بأول
  useEffect(() => {
    if (result) return;
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ serviceId, date, time, form })
      );
    } catch {
      /* تخزين غير متاح */
    }
  }, [serviceId, date, time, form, result]);

  // استرجاع المسودة بعد تحميل الخدمات (تحقق أن الخدمة لازالت موجودة)
  useEffect(() => {
    if (draftRestored.current || !services) return;
    draftRestored.current = true;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<{
        serviceId: number;
        date: string;
        time: string;
        form: BookingFormState;
      }>;
      const svc = draft.serviceId
        ? services.find((s) => s.id === draft.serviceId)
        : undefined;
      if (!svc || !draft.form?.name) return;
      setServiceId(svc.id);
      setDate(draft.date ?? null);
      setForm(draft.form);
      showToast("info", "استعدنا بياناتك السابقة — أكمل حجزك من حيث توقفت");
    } catch {
      /* مسودة تالفة */
    }
  }, [services, showToast]);

  /* ───────── رابط مباشر /booking?service=N ───────── */

  useEffect(() => {
    if (deepLinkHandled.current || !services) return;
    deepLinkHandled.current = true;
    const param = searchParams.get("service");
    if (!param) return;
    const id = Number(normalizeDigits(param));
    const svc = Number.isInteger(id)
      ? services.find((s) => s.id === id)
      : undefined;
    if (svc) {
      setServiceId(svc.id);
      setDirection(1);
      setStep(2);
      showToast("success", `تم اختيار «${svc.name}» — اختر اليوم المناسب لك`);
    }
  }, [services, searchParams, showToast]);

  /* ───────── جلب التوفر عند تغيّر الخدمة أو اليوم ───────── */

  useEffect(() => {
    if (!serviceId || !date) return;
    let cancelled = false;
    setAvailability({ status: "loading" });
    (async () => {
      try {
        const res = await fetch(
          `/api/availability?date=${date}&serviceId=${serviceId}`,
          { cache: "no-store" }
        );
        const data = (await res.json().catch(() => null)) as AvailabilityData | null;
        if (cancelled) return;
        if (!res.ok || !data) throw new Error("bad response");
        setAvailability({ status: "success", data });
      } catch {
        if (!cancelled)
          setAvailability({
            status: "error",
            message:
              "تعذر تحميل المواعيد المتاحة — تحقق من اتصالك وحاول مرة أخرى.",
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serviceId, date, availabilityTick]);

  /* إزالة وقت مختار لم يعد متاحًا بعد تحديث التوفر */
  useEffect(() => {
    if (availability.status !== "success" || !time) return;
    if (!availability.data.slots.includes(time)) setTime(null);
  }, [availability, time]);

  /* ───────── تمرير سلس عند تغيّر الخطوة أو النجاح ───────── */

  useEffect(() => {
    if (skipFirstScroll.current) {
      skipFirstScroll.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  useEffect(() => {
    if (result)
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  /* ───────── إخفاء التنبيه تلقائيًا ───────── */

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  /* ───────── التحقق من صحة النموذج ───────── */

  const errors = useMemo(
    () => ({
      name:
        form.name.trim().length >= 3
          ? ""
          : "يرجى إدخال الاسم الكامل (٣ أحرف على الأقل).",
      phone: isValidEgyptianPhone(form.phone)
        ? ""
        : "رقم الموبايل غير صحيح — مثال: 01012345678",
    }),
    [form.name, form.phone]
  );
  const formValid = errors.name === "" && errors.phone === "";

  const canNext =
    step === 1
      ? serviceId !== null
      : step === 2
        ? date !== null
        : step === 3
          ? time !== null
          : step === 4
            ? formValid
            : true;

  /* ───────── التنقل ───────── */

  function goTo(next: number) {
    if (next === step || next < 1 || next > STEP_COUNT) return;
    setDirection(next > step ? 1 : -1);
    // عند العودة لخطوة الوقت من خطوة لاحقة نحدّث التوفر لضمان عدم حجز موعد انتهى
    if (next === 3 && step > 3) refreshAvailability();
    setStep(next);
  }

  function handleNext() {
    if (step === 4 && !formValid) {
      setTouched({ name: true, phone: true });
      showToast("error", "يرجى استكمال البيانات المطلوبة أولًا.");
      return;
    }
    if (!canNext) return;
    goTo(step + 1);
  }

  /* ───────── إدخال البيانات ───────── */

  function handleFormField(field: keyof BookingFormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === "name" || field === "phone") setSubmitError(null);
  }

  function handleBlur(field: "name" | "phone") {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  /* ───────── إرسال الحجز ───────── */

  async function handleSubmit() {
    if (!serviceId || !date || !time || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          date,
          time,
          patientName: form.name.trim(),
          phone: normalizeDigits(form.phone).replace(/[\s-]/g, ""),
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        refCode?: string;
        booking?: BookingResult["booking"];
        error?: string;
      } | null;

      if (res.status === 201 && data?.ok && data.refCode && data.booking) {
        try {
          sessionStorage.removeItem("booking-draft");
        } catch {
          /* تجاهل */
        }
        setResult({ refCode: data.refCode, booking: data.booking });
        return;
      }

      const message =
        data?.error ?? "حدث خطأ غير متوقع أثناء إنشاء الحجز — حاول مرة أخرى.";
      if (res.status === 409) {
        // الموعد لم يعد متاحًا — عد به لاختيار معاد آخر بفتحات محدّثة
        showToast("error", message);
        setTime(null);
        refreshAvailability();
        setDirection(-1);
        setStep(3);
      } else {
        setSubmitError(message);
        showToast("error", message);
      }
    } catch {
      const message =
        "تعذر الاتصال بالخادم — تحقق من اتصالك بالإنترنت وحاول مرة أخرى.";
      setSubmitError(message);
      showToast("error", message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setResult(null);
    setServiceId(null);
    setDate(null);
    setTime(null);
    setAvailability({ status: "idle" });
    setForm({ name: "", phone: "", notes: "" });
    setTouched({ name: false, phone: false });
    setSubmitError(null);
    setDirection(-1);
    setStep(1);
  }

  /* ───────── العرض ───────── */

  return (
    <div ref={topRef} className="scroll-mt-28">
      <BookingToast toast={toast} />

      {result ? (
        <SuccessScreen
          result={result}
          service={selectedService}
          whatsapp={whatsapp}
          address={address}
          mapUrl={mapUrl}
          onReset={handleReset}
        />
      ) : (
        <div className="card-base overflow-hidden">
          {/* شريط تقدم الخطوات */}
          <div className="border-b border-ink-100 bg-gradient-to-l from-brand-50/80 via-white to-white px-5 py-6 sm:px-8">
            <Stepper step={step} onStepClick={(i) => goTo(i + 1)} />
          </div>

          {/* محتوى الخطوة الحالية */}
          <div className="px-5 py-7 sm:px-8 sm:py-9">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.34, ease: "easeOut" }}
              >
                {step === 1 && (
                  <StepService
                    services={services}
                    loading={servicesLoading}
                    error={servicesError}
                    selectedId={serviceId}
                    onSelect={(svc) => {
                      setServiceId(svc.id);
                      setTime(null);
                    }}
                    onRetry={() => void loadServices()}
                  />
                )}
                {step === 2 && (
                  <StepDate
                    selectedDate={date}
                    offDays={offDays}
                    onSelect={(d) => {
                      setDate(d);
                      setTime(null);
                    }}
                  />
                )}
                {step === 3 && (
                  <StepTime
                    service={selectedService}
                    date={date}
                    state={availability}
                    selectedTime={time}
                    onSelect={setTime}
                    onBack={() => goTo(2)}
                    onRetry={refreshAvailability}
                  />
                )}
                {step === 4 && (
                  <StepDetails
                    form={form}
                    touched={touched}
                    errors={errors}
                    service={selectedService}
                    date={date}
                    time={time}
                    onChange={handleFormField}
                    onBlur={handleBlur}
                  />
                )}
                {step === 5 && (
                  <StepConfirm
                    form={form}
                    service={selectedService}
                    date={date}
                    time={time}
                    submitError={submitError}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* شريط التنقل السفلي */}
          <div className="flex items-center justify-between gap-3 border-t border-ink-100 bg-gradient-to-l from-ink-50/70 to-white px-5 py-4 sm:px-8">
            {step > 1 ? (
              <button type="button" onClick={() => goTo(step - 1)} className={NAV_BACK}>
                <ArrowRight className="h-4 w-4" />
                السابق
              </button>
            ) : (
              <p className="hidden text-xs font-bold text-ink-600 sm:block">
                خطوة {toArabicDigits(1)} من {toArabicDigits(STEP_COUNT)}
              </p>
            )}

            {step < STEP_COUNT ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canNext && step !== 4}
                className={`${NAV_NEXT} ${step === 4 && !formValid ? "opacity-70" : ""}`}
              >
                التالي
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className={NAV_NEXT}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جارٍ تأكيد الحجز…
                  </>
                ) : (
                  <>
                    <CalendarCheck className="h-4 w-4" />
                    تأكيد الحجز
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
