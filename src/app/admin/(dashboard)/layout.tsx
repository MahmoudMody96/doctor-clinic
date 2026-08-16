"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarCheck,
  CalendarClock,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Stethoscope,
  X,
  type LucideIcon,
} from "lucide-react";
import Logo from "@/components/Logo";

const NAV: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] =
  [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true },
    { href: "/admin/bookings", label: "الحجوزات", icon: CalendarCheck },
    { href: "/admin/schedule", label: "المواعيد", icon: CalendarClock },
    { href: "/admin/services", label: "الخدمات", icon: Stethoscope },
    { href: "/admin/content", label: "المحتوى", icon: FileText },
  ];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // إغلاق قائمة الموبايل عند التنقل
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // جلب اسم الطبيب للجلسة الحالية
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("unauthorized");
        return res.json();
      })
      .then((data: { name?: string }) => {
        if (!cancelled) setDoctorName(data.name || "الطبيب");
      })
      .catch(() => {
        if (!cancelled) router.replace("/admin/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // نتجاهل أخطاء الشبكة ونكمل التحويل
    }
    router.replace("/admin/login");
    router.refresh();
  }

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const sidebarInner = (
    <div className="flex h-full flex-col">
      {/* الشعار */}
      <div className="flex items-center justify-between px-6 pb-8 pt-7">
        <Logo dark />
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-xl p-2 text-ink-300 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="إغلاق القائمة"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* الروابط */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4">
        {NAV.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
                active
                  ? "bg-gradient-to-l from-brand-600 to-brand-500 text-white shadow-glow"
                  : "text-ink-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute end-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-gold-400"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon
                className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  active ? "text-white" : "text-brand-300"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* أسفل السايدبار: اسم الطبيب وتسجيل الخروج */}
      <div className="mt-6 border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-display text-base font-extrabold text-white">
            {doctorName ? doctorName.trim().charAt(0) : "…"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">
              {doctorName ?? "جارٍ التحميل…"}
            </p>
            <p className="text-[11px] text-brand-300">طبيب الأسنان — مدير النظام</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-300 transition hover:bg-rose-500/25 hover:text-rose-200 disabled:opacity-60"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6fafb]">
      {/* ═══ سايدبار ثابت للشاشات الكبيرة (يمين) ═══ */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-72 lg:block">
        <div className="h-full border-e border-white/10 bg-gradient-to-b from-ink-950 via-ink-950 to-[#0d2c40]">
          {sidebarInner}
        </div>
      </aside>

      {/* ═══ سايدبار منزلق للموبايل ═══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 end-0 z-50 w-72 max-w-[85vw] lg:hidden"
            >
              <div className="h-full bg-gradient-to-b from-ink-950 via-ink-950 to-[#0d2c40]">
                {sidebarInner}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══ توب بار الموبايل ═══ */}
      <header className="sticky top-0 z-30 glass border-b border-ink-100 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-ink-100 bg-white p-2.5 text-ink-700 shadow-card transition active:scale-95"
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo compact />
          <span className="w-11" aria-hidden="true" />
        </div>
      </header>

      {/* ═══ المحتوى ═══ */}
      <main className="lg:ms-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          {children}
        </div>
      </main>
    </div>
  );
}
