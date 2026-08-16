"use client";

import { motion } from "framer-motion";
import { Cpu, Feather, HeartHandshake, ShieldCheck, type LucideIcon } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "./reveal";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: Cpu,
    title: "تقنيات ألمانية حديثة",
    desc: "أجهزة أشعة رقمية وليزر وتصوير ثلاثي الأبعاد، لتشخيص أدق وعلاج أسرع بوقت انتظار أقل.",
  },
  {
    icon: ShieldCheck,
    title: "تعقيم بمعايير عالمية",
    desc: "بروتوكولات تعقيم صارمة وتغليف مُحكم لكل أداة قبل كل استخدام — صحة كليتك أولويتنا.",
  },
  {
    icon: Feather,
    title: "تجربة بدون ألم",
    desc: "تخدير موضعي لطيف وتقنيات حديثة تجعل جلستك مريحة تمامًا من اللحظة الأولى حتى النهاية.",
  },
  {
    icon: HeartHandshake,
    title: "متابعة بعد العلاج",
    desc: "نتواصل معك بعد كل إجراء للاطمئنان على حالتك، ونرافقك خطوة بخطوة حتى نتيجة تدوم.",
  },
];

export default function WhyUs() {
  return (
    <section className="section-pad relative overflow-hidden bg-gradient-to-b from-white via-brand-50/60 to-white">
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl"
      />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="لماذا نحن"
          title="لأن ابتسامتك"
          highlight="أمانة عندنا"
          subtitle="لا نكتفي بعلاج الأسنان، بل نصنع تجربة كاملة تشعر فيها بالراحة والثقة في كل زيارة."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="card-base group relative overflow-hidden p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-soft"
            >
              {/* رقم مائي خلفي */}
              <span
                aria-hidden
                className="pointer-events-none absolute -top-3 left-3 select-none font-display text-7xl font-black text-brand-50 transition-colors duration-300 group-hover:text-brand-100"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700 ring-1 ring-brand-200/70 transition-all duration-300 group-hover:from-brand-500 group-hover:to-brand-700 group-hover:text-white group-hover:shadow-glow">
                <feature.icon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
              </span>

              <h3 className="relative mt-5 font-display text-base font-extrabold text-ink-900">
                {feature.title}
              </h3>
              <p className="relative mt-2.5 text-sm leading-7 text-ink-600">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
