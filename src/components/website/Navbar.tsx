"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

const LINKS = [
  { href: "#home", label: "الرئيسية" },
  { href: "#services", label: "الخدمات" },
  { href: "#about", label: "عن الطبيب" },
  { href: "#testimonials", label: "آراء المرضى" },
  { href: "#contact", label: "تواصل معنا" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";
  const href = (hash: string) => (onHome ? hash : `/${hash}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // إغلاق قائمة الموبايل عند تكبير الشاشة
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? "glass shadow-soft" : "bg-transparent"
      }`}
    >
      <div
        className={`container-x flex items-center justify-between transition-all duration-300 ${
          scrolled ? "py-2.5" : "py-4"
        }`}
      >
        <Logo />

        {/* روابط سطح المكتب */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="التنقل الرئيسي">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={href(link.href)}
              className="group relative py-1 text-sm font-bold text-ink-700 transition-colors hover:text-brand-700"
            >
              {link.label}
              <span
                aria-hidden
                className="absolute -bottom-0.5 right-0 h-0.5 w-0 rounded-full bg-gradient-to-l from-brand-500 to-gold-400 transition-all duration-300 group-hover:w-full"
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/booking"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-brand-800 to-brand-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 sm:gap-2 sm:px-6 sm:text-sm"
          >
            <CalendarCheck className="h-4 w-4" />
            احجز الآن
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-ink-100 bg-white/80 text-ink-800 shadow-card transition-colors hover:border-brand-300 hover:text-brand-700 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* قائمة الموبايل */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden lg:hidden"
            aria-label="قائمة الموبايل"
          >
            <div className="container-x flex flex-col gap-1 pb-5 pt-1">
              {LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={href(link.href)}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.25 }}
                  className="rounded-xl px-4 py-3 text-sm font-bold text-ink-800 transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  {link.label}
                </motion.a>
              ))}
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className="btn-primary mt-3 text-sm"
              >
                <CalendarCheck className="h-4 w-4" />
                احجز موعدك الآن
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
