"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useInView } from "framer-motion";
import { Award, GraduationCap, Star } from "lucide-react";
import type { ContentMap } from "@/types";
import { fadeUp, staggerContainer, viewportOnce } from "./reveal";

/** عداد أرقام متحرك يبدأ عند ظهوره للشاشة */
function Counter({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) =>
        setDisplay(
          decimals > 0
            ? v.toFixed(decimals)
            : Math.round(v).toLocaleString("en-US")
        ),
    });
    return () => controls.stop();
  }, [inView, value, decimals]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function toNumber(value: string | undefined, fallback: number): number {
  const n = parseFloat((value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

const CREDENTIALS = [
  {
    icon: GraduationCap,
    text: "زمالة كلية الجراحين الملكية — إدنبرة",
  },
  {
    icon: Award,
    text: "ماجستير طب وتجميل الأسنان — جامعة القاهرة",
  },
];

export default function About({ content }: { content: ContentMap }) {
  const doctorName = content.doctor_name ?? "د. أحمد الشريف";

  const experience = toNumber(content.experience_years, 15);
  const patients = toNumber(content.patients_count, 12000);
  const rating = toNumber(content.rating, 4.9);

  return (
    <section
      id="about"
      className="section-pad relative scroll-mt-20 overflow-hidden bg-ink-950"
    >
      {/* زخارف الخلفية الداكنة */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="animate-float-slow absolute bottom-0 -left-28 h-96 w-96 rounded-full bg-brand-800/50 blur-3xl" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-brand-400) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            maskImage:
              "radial-gradient(ellipse 60% 55% at 50% 45%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 55% at 50% 45%, black, transparent)",
          }}
        />
      </div>

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-2">
        {/* ═══ بطاقة الطبيب ═══ */}
        <motion.div
          initial={{ opacity: 0, x: -36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div
            aria-hidden
            className="absolute inset-4 rounded-[2.5rem] bg-brand-500/20 blur-2xl"
          />
          <div className="relative rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            {/* صورة الطبيب — استبدل الملف public/images/doctor.jpg بالصورة الرسمية */}
            <div className="relative mx-auto h-48 w-48">
              <span
                aria-hidden
                className="animate-pulse-ring absolute inset-0 rounded-full bg-brand-500/40"
              />
              <span
                aria-hidden
                className="absolute -inset-3 rounded-full border border-brand-400/30"
              />
              <span
                aria-hidden
                className="absolute -inset-7 rounded-full border border-brand-400/15"
              />
              <Image
                src="/images/doctor.jpg"
                alt={`${doctorName} — ${content.doctor_title ?? "استشاري طب وتجميل الأسنان"}`}
                width={192}
                height={192}
                priority={false}
                className="animate-float relative h-48 w-48 rounded-full object-cover shadow-glow ring-2 ring-brand-400/60"
              />
            </div>

            <div className="mt-6 text-center">
              <h3 className="font-display text-2xl font-extrabold text-white">
                {doctorName}
              </h3>
              <p className="mt-1.5 text-sm font-bold text-brand-300">
                {content.doctor_title}
              </p>
            </div>

            {/* شارات النسب العلمية */}
            <div className="mt-7 flex flex-col gap-2.5">
              {CREDENTIALS.map((c) => (
                <span
                  key={c.text}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-ink-100 transition-colors hover:border-brand-400/40 hover:bg-brand-400/10"
                >
                  <c.icon className="h-5 w-5 shrink-0 text-gold-400" />
                  {c.text}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══ النص والعدادات ═══ */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1.5 text-xs font-extrabold text-brand-300"
          >
            <Award className="h-3.5 w-3.5" />
            عن الطبيب
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="mt-5 font-display text-3xl font-black leading-snug text-white sm:text-4xl"
          >
            خبرة تجمع بين{" "}
            <span className="bg-gradient-to-l from-brand-300 to-gold-400 bg-clip-text text-transparent">
              العلم والفن
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-5 text-base leading-8 text-ink-300"
          >
            {content.about_short}
          </motion.p>

          {/* عدادات متحركة */}
          <motion.div
            variants={fadeUp}
            className="mt-10 grid grid-cols-3 gap-3 sm:gap-4"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center sm:p-5">
              <p className="font-display text-2xl font-black text-brand-300 sm:text-3xl">
                <Counter value={experience} suffix="+" />
              </p>
              <p className="mt-1.5 text-xs font-bold text-ink-300 sm:text-sm">
                سنة خبرة
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center sm:p-5">
              <p className="font-display text-2xl font-black text-brand-300 sm:text-3xl">
                <Counter value={patients} suffix="+" />
              </p>
              <p className="mt-1.5 text-xs font-bold text-ink-300 sm:text-sm">
                مريض سعيد
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center sm:p-5">
              <p className="flex items-center justify-center gap-1 font-display text-2xl font-black text-brand-300 sm:text-3xl">
                <Star className="h-5 w-5 fill-gold-400 text-gold-400" />
                <Counter value={rating} decimals={1} />
              </p>
              <p className="mt-1.5 text-xs font-bold text-ink-300 sm:text-sm">
                تقييم المرضى
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
