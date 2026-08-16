"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Loader2, LogIn, User } from "lucide-react";
import Logo from "@/components/Logo";

/** صفحة دخول لوحة التحكم — تصميم منقسم فاخر */
export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "بيانات الدخول غير صحيحة، حاول مرة أخرى.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم، تحقق من الإنترنت وحاول مجددًا.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ═══ الجانب التزييني المتدرج ═══ */}
      <section className="relative hidden overflow-hidden bg-gradient-to-bl from-ink-950 via-ink-900 to-brand-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* هالات ضوئية */}
        <div className="pointer-events-none absolute -top-32 -start-32 h-96 w-96 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -end-24 h-[28rem] w-[28rem] rounded-full bg-gold-500/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 end-16 h-24 w-24 animate-pulse-ring rounded-full border-2 border-brand-400/40" />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10"
        >
          <Logo dark />
        </motion.div>

        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.7, type: "spring" }}
            className="mb-8 flex h-24 w-24 animate-float items-center justify-center rounded-[2rem] bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-12 w-12 text-white"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2.5c-2.1 0-2.9.9-4.5.9-2.3 0-4 2.1-4 4.6 0 1.9.8 3.3 1.4 4.7.6 1.5 1 3.3 1.2 5.5.1 1.1.7 2.3 1.9 2.3 1.5 0 1.8-1.5 2.1-3 .3-1.4.6-2.9 1.9-2.9s1.6 1.5 1.9 2.9c.3 1.5.6 3 2.1 3 1.2 0 1.8-1.2 1.9-2.3.2-2.2.6-4 1.2-5.5.6-1.4 1.4-2.8 1.4-4.7 0-2.5-1.7-4.6-4-4.6-1.6 0-2.4-.9-4.5-.9z" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="font-display text-4xl font-extrabold leading-snug text-white"
          >
            لوحة تحكم
            <span className="text-gradient block">عيادة الشريف</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="mt-5 text-base leading-8 text-ink-200"
          >
            إدارة شاملة لحجوزات المرضى، مواعيد العمل، الخدمات، ومحتوى الموقع —
            كل ذلك من مكان واحد بتجربة سلسة وأنيقة.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            {["الحجوزات", "المواعيد", "الخدمات", "المحتوى"].map((t, i) => (
              <span
                key={t}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold ${
                  i === 0
                    ? "border-brand-400/50 bg-brand-500/20 text-brand-200"
                    : "border-white/15 bg-white/5 text-ink-200"
                }`}
              >
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="relative z-10 text-xs text-ink-300"
        >
          © {new Date().getFullYear()} عيادة الشريف لطب وتجميل الأسنان — جميع
          الحقوق محفوظة
        </motion.p>
      </section>

      {/* ═══ فورم الدخول ═══ */}
      <section className="relative flex items-center justify-center bg-[#fbfdfe] px-5 py-12 sm:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-brand-50 to-transparent lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>

          <div className="card-base p-7 sm:p-9">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              منطقة خاصة بالطبيب
            </span>
            <h2 className="mt-5 font-display text-2xl font-extrabold text-ink-900">
              تسجيل الدخول
            </h2>
            <p className="mt-2 text-sm leading-7 text-ink-500">
              أدخل بيانات حسابك للوصول إلى لوحة تحكم العيادة وإدارة الحجوزات.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="username" className="label-base">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <User className="absolute start-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-300" />
                  <input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="input-base ps-11 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label-base">
                  كلمة المرور
                </label>
                <div className="relative">
                  <KeyRound className="absolute start-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-300" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-base px-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                    className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-700"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جارٍ التحقق من البيانات…
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    دخول لوحة التحكم
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-ink-400">
            هذه الصفحة مخصصة لإدارة العيادة فقط.
            <br />
            لحجز موعد جديد يرجى استخدام صفحة الحجز في الموقع الرئيسي.
          </p>
        </motion.div>
      </section>
    </main>
  );
}
