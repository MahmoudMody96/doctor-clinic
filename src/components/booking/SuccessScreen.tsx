"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  Clock,
  Copy,
  Home,
  MapPin,
  RotateCcw,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ServiceDTO } from "@/types";
import { formatDateAr, formatPrice, formatTime12 } from "@/lib/utils";
import ServiceIcon from "@/components/ServiceIcon";
import type { BookingResult } from "./helpers";

/** أيقونة واتساب رسمية (غير متوفرة في lucide) */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 px-4 py-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-card">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-ink-600">{label}</p>
        <p className="truncate text-sm font-extrabold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

/** شاشة النجاح الاحتفالية — أيقونة متحركة + رقم مرجعي قابل للنسخ + واتساب */
export default function SuccessScreen({
  result,
  service,
  whatsapp,
  address,
  mapUrl,
  onReset,
}: {
  result: BookingResult;
  service: ServiceDTO | null;
  whatsapp: string;
  address: string;
  mapUrl: string;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  /** ملف تقويم ICS لتنبيه الموعد (بلا مكتبات) */
  function buildIcsHref() {
    const day = result.booking.date.replace(/-/g, "");
    const [h, m] = result.booking.time.split(":").map(Number);
    const end = new Date(2000, 0, 1, h, m + (service?.durationMin ?? 30));
    const endStr =
      String(end.getHours()).padStart(2, "0") + String(end.getMinutes()).padStart(2, "0");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ElSherif Clinic//AR",
      "BEGIN:VEVENT",
      `UID:${result.refCode}@elsherif-clinic`,
      `DTSTART:${day}T${result.booking.time.replace(":", "")}00`,
      `DTEND:${day}T${endStr}00`,
      `SUMMARY:${result.booking.serviceName} — عيادة الشريف`,
      `LOCATION:${address}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
  }

  async function copyRef() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(result.refCode);
      } else {
        const ta = document.createElement("textarea");
        ta.value = result.refCode;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* تجاهل فشل النسخ */
    }
  }

  const waText = encodeURIComponent(
    `حجز جديد برقم ${result.refCode}\n` +
      `الاسم: ${result.booking.patientName}\n` +
      `الخدمة: ${result.booking.serviceName}\n` +
      `الموعد: ${formatDateAr(result.booking.date)} — ${formatTime12(result.booking.time)}`
  );
  const waHref = `https://wa.me/${whatsapp}?text=${waText}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative"
    >
      {/* زخارف عائمة */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-5 right-8 animate-float text-gold-400"
        >
          <Sparkles className="h-7 w-7" />
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="absolute -top-2 left-12 animate-float-slow text-brand-300"
        >
          <Sparkles className="h-5 w-5" />
        </motion.span>
      </div>

      <div className="card-base overflow-hidden">
        {/* الرأس الاحتفالي */}
        <div className="relative overflow-hidden bg-gradient-to-l from-ink-900 via-ink-800 to-brand-900 px-6 pb-9 pt-12 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-1/3 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-gold-400/10 blur-3xl"
          />

          {/* أيقونة النجاح المتحركة */}
          <div className="relative mx-auto mb-5 h-24 w-24">
            <span
              aria-hidden
              className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-brand-400/60"
            />
            <span
              aria-hidden
              className="absolute inset-0 animate-pulse-ring rounded-full border border-gold-400/40"
              style={{ animationDelay: "1.2s" }}
            />
            <motion.svg
              viewBox="0 0 100 100"
              className="relative h-24 w-24 drop-shadow-[0_0_18px_rgba(45,212,191,0.55)]"
              initial={false}
            >
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
              <motion.path
                d="M33 51.5 45 63 68 37"
                fill="none"
                stroke="#5eead4"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.55, duration: 0.45, ease: "easeOut" }}
              />
            </motion.svg>
          </div>

          <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            تم تأكيد حجزك بنجاح
          </h2>
          <p className="mt-2 text-sm leading-7 text-ink-200">
            أهلًا {result.booking.patientName}، سعداء بلقائك قريبًا — تفاصيل
            موعدك بالأسفل.
          </p>
        </div>

        <div className="px-5 py-8 sm:px-8">
          {/* الرقم المرجعي */}
          <div className="rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/70 p-6 text-center">
            <p className="text-xs font-extrabold text-brand-700">رقم الحجز المرجعي</p>
            <motion.p
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 16 }}
              dir="ltr"
              className="mt-2 font-display text-4xl font-extrabold tracking-widest text-ink-900 sm:text-5xl"
            >
              {result.refCode}
            </motion.p>
            <button
              type="button"
              onClick={() => void copyRef()}
              aria-label="نسخ الرقم المرجعي"
              className={`mt-4 inline-flex items-center gap-2 rounded-full border-2 px-5 py-2 text-xs font-extrabold transition-all duration-300 ${
                copied
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-brand-200 bg-white text-brand-700 hover:-translate-y-0.5 hover:border-brand-400"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={3} />
                  تم النسخ!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  نسخ الرقم
                </>
              )}
            </button>
          </div>

          {/* تفاصيل الحجز */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <DetailRow
              icon={<ServiceIcon name={service?.icon ?? "Stethoscope"} className="h-4.5 w-4.5" />}
              label="الخدمة"
              value={result.booking.serviceName}
            />
            <DetailRow
              icon={<CalendarDays className="h-4.5 w-4.5" />}
              label="اليوم"
              value={formatDateAr(result.booking.date)}
            />
            <DetailRow
              icon={<Clock className="h-4.5 w-4.5" />}
              label="الوقت"
              value={formatTime12(result.booking.time)}
            />
            {service && (
              <DetailRow
                icon={<Wallet className="h-4.5 w-4.5" />}
                label="الإجمالي (يُدفع في العيادة)"
                value={formatPrice(service.price)}
              />
            )}
            {address && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 px-4 py-3.5 transition-colors hover:border-brand-300 hover:bg-brand-50/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-card">
                  <MapPin className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 text-right">
                  <span className="block text-xs font-bold text-ink-600">العنوان — افتح على الخريطة</span>
                  <span className="block truncate text-sm font-extrabold text-ink-900">{address}</span>
                </span>
              </a>
            )}
          </div>

          <p className="mt-5 text-center text-xs leading-6 text-ink-600">
            احتفظ بالرقم المرجعي — ستحتاجه عند الاستقبال أو لأي استفسار عن
            حجزك. ولتعديل الموعد أو إلغائه تواصل معنا عبر واتساب.
          </p>

          {/* الأزرار */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={buildIcsHref()}
              download={`${result.refCode}.ics`}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-brand-600 bg-white px-6 py-3.5 text-sm font-extrabold text-brand-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-50"
            >
              <CalendarPlus className="h-4.5 w-4.5" />
              أضِف إلى تقويمك
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1fa855] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
            >
              <WhatsAppIcon className="h-5 w-5" />
              إرسال التفاصيل عبر واتساب
            </a>
            <Link href="/" className="btn-outline flex-1 text-sm">
              <Home className="h-4 w-4" />
              العودة للرئيسية
            </Link>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="mx-auto mt-4 flex items-center gap-1.5 text-xs font-bold text-ink-500 transition-colors hover:text-brand-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            حجز موعد آخر
          </button>
        </div>
      </div>
    </motion.div>
  );
}
