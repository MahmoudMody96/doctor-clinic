"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

/** رقم يتصاعد تدريجيًا عند الظهور — بفواصل آلاف إنجليزية */
export default function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const spring = useSpring(0, { stiffness: 90, damping: 22 });
  const display = useTransform(spring, (v) =>
    Math.round(v).toLocaleString("en-US")
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}
