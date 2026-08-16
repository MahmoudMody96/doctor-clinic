"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MoveHorizontal } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "./reveal";

interface CaseItem {
  title: string;
  note: string;
  before: string;
  after: string;
}

const CASES: CaseItem[] = [
  {
    title: "علاج جذور وترميم كامل",
    note: "خلص من الألم في جلسة واحدة",
    before: "/images/ba-1-before.jpg",
    after: "/images/ba-1-after.jpg",
  },
  {
    title: "تقويم الأسنان",
    note: "خطة تقويم مع متابعة شهرية",
    before: "/images/ba-2-before.jpg",
    after: "/images/ba-2-after.jpg",
  },
  {
    title: "تبييض بالليزر",
    note: "نتيجة ملحوظة من أول جلسة",
    before: "/images/ba-3-before.jpg",
    after: "/images/ba-3-after.jpg",
  },
];

/** بطاقة مقارنة تفاعلية — السحب أو الأسهم على الكيبورد تحرك الفاصل */
function CompareCard({ item, index }: { item: CaseItem; index: number }) {
  const [pos, setPos] = useState(50);

  return (
    <motion.figure variants={fadeUp} className="group/card">
      <div
        dir="ltr"
        className="relative aspect-[4/3] select-none overflow-hidden rounded-3xl border border-ink-100 shadow-card"
      >
        {/* طبقة «بعد» الأساسية */}
        <Image
          src={item.after}
          alt={`النتيجة بعد ${item.title} — ابتسامة سليمة`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className="object-cover"
        />
        {/* طبقة «قبل» مقصوصة من اليمين */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        >
          <Image
            src={item.before}
            alt={`الحالة قبل ${item.title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className="object-cover"
          />
        </div>

        {/* شارتا التعريف — قبل يمين وبعد يسار */}
        <span className="absolute right-3 top-3 z-10 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-sm">
          قبل
        </span>
        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-700/90 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-sm">
          بعد
        </span>

        {/* الفاصل والمقبض */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.35)]"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white/95 text-brand-700 shadow-soft transition-transform duration-200 group-hover/card:scale-110">
            <MoveHorizontal className="h-5 w-5" />
          </span>
        </div>

        {/* مدى شفاف: سحب بالماوس + أسهم الكيبورد مجانًا */}
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`مقارنة قبل وبعد — حالة ${index + 1}: ${item.title}. استخدم أسهم الكيبورد لتحريك الفاصل`}
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>

      <figcaption className="mt-4 flex items-center justify-between gap-3 px-1">
        <div>
          <h3 className="font-display text-base font-extrabold text-ink-900">
            {item.title}
          </h3>
          <p className="mt-0.5 text-sm text-ink-600">{item.note}</p>
        </div>
        <span
          aria-hidden
          className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-700"
        >
          {`${index + 1} / ${CASES.length}`}
        </span>
      </figcaption>
    </motion.figure>
  );
}

/** قسم قبل وبعد — أعلى رافعة ثقة في تجميل الأسنان */
export default function BeforeAfter() {
  return (
    <section id="results" className="section-pad scroll-mt-20 bg-ink-50/60">
      <div className="container-x">
        <SectionHeading
          eyebrow="قبل وبعد"
          title="نتائج تتكلم"
          highlight="عن نفسها"
          subtitle="اسحب المقبض (أو استخدم أسهم الكيبورد) لمقارنة الحالة قبل وبعد — نفس التقنيات التي نقدمها يوميًا في العيادة."
          dark={false}
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {CASES.map((item, i) => (
            <CompareCard key={item.title} item={item} index={i} />
          ))}
        </motion.div>

        <p className="mt-8 text-center text-xs leading-6 text-ink-500">
          صور توضيحية من مكتبة مرخصة لأغراض العرض — تُستبدل بحالات العيادة
          الفعلية فور توفر الموافقات اللازمة من المرضى.
        </p>
      </div>
    </section>
  );
}
