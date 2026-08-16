"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Quote, Star } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "./reveal";

interface Testimonial {
  name: string;
  role: string;
  text: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "مروة عبد الرحمن",
    role: "معلمة",
    text: "كنت أخاف من دكتور الأسنان من صغري، لكن د. أحمد طمّنني في كل خطوة وعمل لي حشوة بدون أي وجع خالص. العيادة نظيفة والطاقم كله محترم جدًا. أول مرة أطلع من عيادة أسنان وأنا مرتاحة!",
  },
  {
    name: "كريم الشناوي",
    role: "مهندس برمجيات",
    text: "عملت تقويم عند الدكتور لمدة سنة تقريبًا والنتيجة فاقت توقعاتي بصراحة. كان يتابع معي أولًا بأول ويشرح كل مرحلة بالصور والمخططات. مواعيده دقيقة والتعامل راقٍ جدًا.",
  },
  {
    name: "سلمى محمود",
    role: "صيدلانية",
    text: "تبييض الأسنان عنده مختلف عن أي مكان جربته، النتيجة طبيعية وحسيت بفرق من أول جلسة. والحجز الإلكتروني وفّر عليّ وقت ومجهود. أنصح أي حد يدخل بثقة كاملة.",
  },
];

function StarsRow() {
  return (
    <div className="flex items-center gap-1" aria-label="تقييم 5 من 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="section-pad scroll-mt-20 relative overflow-hidden bg-white"
    >
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute top-20 -right-24 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl"
      />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="آراء المرضى"
          title="ابتساماتهم"
          highlight="أفضل شهادة لنا"
          subtitle="أكثر من 12 ألف مريض اختارونا خلال 15 عامًا — هذه بعض تجاربهم الحقيقية معنا."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              variants={fadeUp}
              className={`card-base relative flex flex-col p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-soft ${
                i === 1 ? "md:-translate-y-4 md:hover:-translate-y-6" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <StarsRow />
                <Quote className="h-8 w-8 fill-brand-100 text-brand-200" />
              </div>

              <blockquote className="mt-4 flex-1 text-sm leading-8 text-ink-700">
                “{t.text}”
              </blockquote>

              <figcaption className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 font-display text-lg font-extrabold text-brand-800">
                  {t.name[0]}
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-ink-900">
                    {t.name}
                  </span>
                  <span className="block text-xs font-medium text-ink-500">
                    {t.role}
                  </span>
                </span>
                <BadgeCheck
                  className="ms-auto h-5 w-5 shrink-0 text-brand-500"
                  aria-label="مريض موثّق"
                />
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
