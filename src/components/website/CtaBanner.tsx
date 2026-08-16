"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce } from "./reveal";

export default function CtaBanner() {
  return (
    <section className="container-x py-10 sm:py-14" aria-label="دعوة للحجز">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-l from-brand-800 via-brand-600 to-brand-700 px-6 py-14 text-center shadow-soft sm:px-12 sm:py-16"
      >
        {/* زخارف متحركة */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -top-24 -right-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="animate-float-slow absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage:
                "radial-gradient(ellipse 70% 80% at 50% 50%, black, transparent)",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 80% at 50% 50%, black, transparent)",
            }}
          />
        </div>

        <motion.h2
          variants={fadeUp}
          className="relative font-display text-3xl font-black text-white sm:text-4xl"
        >
          ابتسامتك تستحق <span className="text-gold-400">الأفضل</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="relative mx-auto mt-4 max-w-xl text-base leading-8 text-brand-50/90"
        >
          احجز موعدك الآن في أقل من دقيقة — اختر الخدمة والوقت المناسب لك،
          واستلم تأكيدًا فوريًا بكود حجز خاص.
        </motion.p>

        <motion.div variants={fadeUp} className="relative mt-8">
          <Link
            href="/booking"
            className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 font-display text-base font-extrabold text-brand-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <CalendarCheck className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            احجز موعدك الآن
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
