"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  CalendarCheck,
  Clock,
  Sparkles,
  Star,
  Stethoscope,
} from "lucide-react";
import type { ContentMap } from "@/types";
import { addDays, formatDateAr, todayCairo } from "@/lib/utils";
import { fadeUp, staggerContainer } from "./reveal";

/** سنّة زخرفية متحركة — نفس مسار شعار العيادة */
function ToothMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.5c-2.1 0-2.9.9-4.5.9-2.3 0-4 2.1-4 4.6 0 1.9.8 3.3 1.4 4.7.6 1.5 1 3.3 1.2 5.5.1 1.1.7 2.3 1.9 2.3 1.5 0 1.8-1.5 2.1-3 .3-1.4.6-2.9 1.9-2.9s1.6 1.5 1.9 2.9c.3 1.5.6 3 2.1 3 1.2 0 1.8-1.2 1.9-2.3.2-2.2.6-4 1.2-5.5.6-1.4 1.4-2.8 1.4-4.7 0-2.5-1.7-4.6-4-4.6-1.6 0-2.4-.9-4.5-.9z" />
    </svg>
  );
}

function toNumber(value: string | undefined, fallback: number): number {
  const n = parseFloat((value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

export default function Hero({ content }: { content: ContentMap }) {
  const title = content.hero_title ?? "ابتسامتك تستحق الأفضل";
  const words = title.split(" ");
  const lastWord = words.length > 1 ? (words.pop() as string) : "";
  const titleLead = words.join(" ");

  const experience = toNumber(content.experience_years, 15);
  const patients = toNumber(content.patients_count, 12000);
  const rating = toNumber(content.rating, 4.9);
  const reviews = toNumber(content.reviews_count, 850);

  // تاريخ "الموعد القادم" التوضيحي — يُحسب على العميل لتفادي اختلاف الترطيب
  const [demoDate, setDemoDate] = useState<string>("غدًا");
  useEffect(() => {
    setDemoDate(formatDateAr(addDays(todayCairo(), 1)));
  }, []);

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-brand-50/90 via-white to-white"
    >
      {/* ═══ خلفيات زخرفية ═══ */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -top-28 -left-28 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl" />
        <div className="animate-float-slow absolute top-1/3 -right-36 h-[30rem] w-[30rem] rounded-full bg-brand-100/80 blur-3xl" />
        <div className="animate-float absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" />
        {/* شبكة نقاط خفيفة */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(var(--color-ink-300) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage:
              "radial-gradient(ellipse 75% 60% at 50% 38%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 60% at 50% 38%, black, transparent)",
          }}
        />
      </div>

      <div className="container-x relative grid items-center gap-14 pb-16 pt-32 sm:pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-44">
        {/* ═══ عمود النص ═══ */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="text-center lg:text-start"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-2 text-xs font-extrabold text-brand-700 shadow-card backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            {content.hero_badge ?? "عيادة متكاملة لطب وتجميل الأسنان"}
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display text-4xl font-black leading-[1.25] text-ink-900 sm:text-5xl lg:text-[3.4rem]"
          >
            {titleLead} <span className="text-gradient">{lastWord}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-base leading-8 text-ink-600 sm:text-lg lg:mx-0"
          >
            {content.hero_subtitle}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Link href="/booking" className="btn-primary group w-full sm:w-auto">
              <CalendarCheck className="h-5 w-5" />
              احجز موعدك
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </Link>
            <a href="#services" className="btn-outline w-full sm:w-auto">
              تعرف على الخدمات
            </a>
          </motion.div>

          {/* صف الإحصائيات */}
          <motion.dl
            variants={fadeUp}
            className="mt-12 grid grid-cols-3 gap-4 border-t border-ink-100 pt-6"
          >
            <div className="text-center lg:text-start">
              <dt className="sr-only">سنوات الخبرة</dt>
              <dd className="font-display text-2xl font-black text-ink-900 sm:text-3xl">
                {Math.round(experience).toLocaleString("en-US")}+
              </dd>
              <dd className="mt-1 text-xs text-ink-600 sm:text-sm">سنة من الخبرة</dd>
            </div>
            <div className="text-center lg:text-start">
              <dt className="sr-only">عدد المرضى</dt>
              <dd className="font-display text-2xl font-black text-ink-900 sm:text-3xl">
                {Math.round(patients).toLocaleString("en-US")}+
              </dd>
              <dd className="mt-1 text-xs text-ink-600 sm:text-sm">مريض سعيد</dd>
            </div>
            <div className="text-center lg:text-start">
              <dt className="sr-only">التقييم</dt>
              <dd className="flex items-center justify-center gap-1.5 font-display text-2xl font-black text-ink-900 sm:text-3xl lg:justify-start">
                <Star className="h-5 w-5 fill-gold-600 text-gold-600" />
                {rating.toFixed(1)}
              </dd>
              <dd className="mt-1 text-xs text-ink-600 sm:text-sm">
                من {Math.round(reviews).toLocaleString("en-US")}+ تقييم
              </dd>
            </div>
          </motion.dl>
        </motion.div>

        {/* ═══ عمود البطاقة الزجاجية ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 44, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          {/* هالة خلف البطاقة */}
          <div
            aria-hidden
            className="absolute inset-5 rounded-[2.5rem] bg-gradient-to-br from-brand-400/35 via-brand-200/25 to-gold-400/20 blur-2xl"
          />

          {/* سنّة ضخمة عائمة في الخلفية */}
          <ToothMark className="animate-float-slow absolute -top-10 left-6 z-0 h-24 w-24 text-brand-200/70" />
          <ToothMark className="animate-float absolute -bottom-6 right-8 z-0 h-14 w-14 text-gold-400/30" />

          {/* بطاقة موعدك القادم */}
          <div className="glass relative z-10 rounded-[2rem] border border-white/70 p-6 shadow-soft sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                  <span
                    aria-hidden
                    className="animate-pulse-ring absolute inset-0 rounded-2xl bg-brand-400/50"
                  />
                  <ToothMark className="animate-float relative h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display text-base font-extrabold text-ink-900">
                    موعدك القادم
                  </h3>
                  <p className="text-[11px] text-ink-600">جاهز للتأكيد خلال دقيقة</p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                متاح اليوم
              </span>
            </div>

            <ul className="mt-6 space-y-1 rounded-2xl border border-ink-100/80 bg-white/75 p-2">
              {[
                {
                  icon: Calendar,
                  label: "التاريخ",
                  value: demoDate,
                  ltr: false,
                },
                { icon: Clock, label: "الوقت", value: "6:30 م", ltr: true },
                {
                  icon: Sparkles,
                  label: "الخدمة",
                  value: "تبييض الأسنان بالليزر",
                  ltr: false,
                },
                {
                  icon: Stethoscope,
                  label: "الطبيب",
                  value: content.doctor_name ?? "د. أحمد الشريف",
                  ltr: false,
                },
              ].map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-50/70"
                >
                  <span className="flex items-center gap-2 text-sm font-bold text-ink-600">
                    <row.icon className="h-4 w-4 text-brand-600" />
                    {row.label}
                  </span>
                  <span
                    className={`text-sm font-extrabold text-ink-900 ${row.ltr ? "tracking-wide" : ""}`}
                  >
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>

            <Link href="/booking" className="btn-primary group mt-6 w-full text-sm">
              <CalendarCheck className="h-4 w-4" />
              تأكيد الحجز الإلكتروني
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </Link>
            <p className="mt-3 text-center text-[11px] font-medium text-ink-500">
              بدون مكالمات هاتفية — تأكيد فوري بكود حجز
            </p>
          </div>

          {/* شارات عائمة حول البطاقة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
            className="animate-float glass absolute -top-7 right-4 z-20 hidden items-center gap-2.5 rounded-2xl border border-white/70 px-4 py-3 shadow-card sm:flex"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400/15">
              <Star className="h-5 w-5 fill-gold-600 text-gold-600" />
            </span>
            <span>
              <span className="block font-display text-sm font-extrabold text-ink-900">
                {rating.toFixed(1)} / 5
              </span>
              <span className="block text-[11px] text-ink-600">تقييم المرضى</span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
            className="animate-float-slow glass absolute -bottom-8 left-2 z-20 hidden items-center gap-2.5 rounded-2xl border border-white/70 px-4 py-3 shadow-card sm:flex"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100">
              <BadgeCheck className="h-5 w-5 text-brand-700" />
            </span>
            <span>
              <span className="block font-display text-sm font-extrabold text-ink-900">
                +{Math.round(patients).toLocaleString("en-US")}
              </span>
              <span className="block text-[11px] text-ink-600">ابتسامة ناجحة</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
