"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce } from "./reveal";

export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  dark = false,
  center = true,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={`${center ? "mx-auto text-center" : "text-start"} max-w-2xl`}
    >
      <motion.span
        variants={fadeUp}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-extrabold ${
          dark
            ? "border border-brand-400/30 bg-brand-400/10 text-brand-300"
            : "border border-brand-200 bg-brand-50 text-brand-700"
        }`}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </motion.span>

      <motion.h2
        variants={fadeUp}
        className={`mt-5 font-display text-3xl font-black leading-snug sm:text-4xl ${
          dark ? "text-white" : "text-ink-900"
        }`}
      >
        {title}{" "}
        {highlight && (
          <span
            className={
              dark
                ? "bg-gradient-to-l from-brand-300 to-gold-400 bg-clip-text text-transparent"
                : "text-gradient"
            }
          >
            {highlight}
          </span>
        )}
      </motion.h2>

      {subtitle && (
        <motion.p
          variants={fadeUp}
          className={`mt-4 text-base leading-8 ${
            dark ? "text-ink-300" : "text-ink-600"
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
