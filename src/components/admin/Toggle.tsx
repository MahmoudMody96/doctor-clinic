"use client";

import { motion } from "framer-motion";

/** سويتش تفعيل/تعطيل متحرك */
export default function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-brand-500 shadow-glow" : "bg-ink-200"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`absolute h-5.5 w-5.5 rounded-full bg-white shadow-md ${
          checked ? "start-[calc(100%-1.5rem)]" : "start-1"
        }`}
      />
    </button>
  );
}
