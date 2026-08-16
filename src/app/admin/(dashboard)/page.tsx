"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  CalendarDays,
  CalendarRange,
  Hourglass,
  Phone,
  RefreshCw,
} from "lucide-react";
import type { StatsResponse } from "@/types";
import { formatDateAr, formatPrice, formatTime12 } from "@/lib/utils";
import ServiceIcon from "@/components/ServiceIcon";
import AnimatedNumber from "@/components/admin/AnimatedNumber";
import StatusBadge from "@/components/admin/StatusBadge";
import { CardSkeleton, ErrorState, EmptyState, StatSkeleton } from "@/components/admin/states";

const PIE_COLORS = ["#14b8a6", "#4a7cab", "#f59e0b", "#5eead4", "#a3c1dc"];

/** اختصار التاريخ "2026-08-14" → "14/08" */
function shortDate(d: string) {
  return `${d.slice(8, 10)}/${d.slice(5, 7)}`;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      dir="rtl"
      className="rounded-2xl border border-ink-100 bg-white/95 px-4 py-2.5 text-xs shadow-soft backdrop-blur"
    >
      <p className="font-bold text-ink-900">
        {label && label.includes("-") ? formatDateAr(label) : label}
      </p>
      <p className="mt-0.5 font-semibold text-brand-700">
        {payload[0].value} حجز
      </p>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (initial = false) => {
    initial ? setLoading(true) : setRefreshing(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setStats((await res.json()) as StatsResponse);
    } catch {
      setError("تعذّر تحميل الإحصائيات من الخادم.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <StatSkeleton />
        <div className="grid gap-6 lg:grid-cols-3">
          <CardSkeleton height="h-80 lg:col-span-2" />
          <CardSkeleton height="h-80" />
        </div>
        <CardSkeleton height="h-72" />
      </div>
    );
  }

  if (error || !stats) {
    return <ErrorState message={error} onRetry={() => load(true)} />;
  }

  const topTotal = stats.topServices.reduce((s, x) => s + x.count, 0);

  const statCards = [
    {
      label: "حجوزات اليوم",
      value: stats.todayCount,
      icon: CalendarDays,
      gradient: "from-brand-600 to-brand-400",
      glow: "bg-brand-300/30",
    },
    {
      label: "حجوزات هذا الأسبوع",
      value: stats.weekCount,
      icon: CalendarRange,
      gradient: "from-ink-800 to-ink-500",
      glow: "bg-ink-300/25",
    },
    {
      label: "قيد الانتظار",
      value: stats.totals.PENDING,
      icon: Hourglass,
      gradient: "from-gold-600 to-gold-400",
      glow: "bg-gold-400/30",
    },
    {
      label: "إجمالي الإيرادات",
      value: stats.revenue,
      icon: Banknote,
      gradient: "from-brand-900 to-brand-600",
      glow: "bg-brand-400/25",
      isPrice: true,
    },
  ];

  return (
    <div className="space-y-7">
      {/* رأس الصفحة */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
            النظرة العامة
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            ملخص أداء العيادة — الحجوزات والإيرادات والخدمات الأكثر طلبًا.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          disabled={refreshing}
          className="btn-outline px-5! py-2.5! text-sm disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          تحديث البيانات
        </button>
      </div>

      {/* كروت الإحصائيات */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-bl ${card.gradient} p-6 text-white shadow-card transition-transform duration-300 hover:-translate-y-1`}
          >
            <div
              className={`pointer-events-none absolute -top-10 -start-10 h-32 w-32 rounded-full ${card.glow} blur-2xl`}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <card.icon className="h-6 w-6" />
                </span>
              </div>
              <p className="mt-5 font-display text-3xl font-extrabold tabular-nums sm:text-4xl">
                {card.isPrice ? (
                  <>
                    <AnimatedNumber value={card.value} />
                    <span className="mr-2 text-lg font-bold opacity-90">ج.م</span>
                  </>
                ) : (
                  <AnimatedNumber value={card.value} />
                )}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-white/85">
                {card.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* الرسوم البيانية */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* رسم المنطقة — آخر 14 يومًا */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="card-base p-5 sm:p-6 lg:col-span-2"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink-900">
                الحجوزات آخر ١٤ يومًا
              </h2>
              <p className="mt-1 text-xs text-ink-400">
                عدد الحجوزات اليومية خلال الأسبوعين الماضيين
              </p>
            </div>
            <span className="rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-700">
              الإجمالي:{" "}
              {stats.last14.reduce((s, d) => s + d.count, 0).toLocaleString("en-US")}
            </span>
          </div>
          <div dir="ltr" className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.last14} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke="#e8eef6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fontSize: 11, fill: "#6f9cc4" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#6f9cc4" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#99f6e4", strokeWidth: 1.5 }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="الحجوزات"
                  stroke="#0d9488"
                  strokeWidth={3}
                  fill="url(#bookingsFill)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#0d9488", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* الدائري — أكثر الخدمات */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="card-base p-5 sm:p-6"
        >
          <h2 className="font-display text-lg font-extrabold text-ink-900">
            أكثر الخدمات طلبًا
          </h2>
          <p className="mt-1 text-xs text-ink-400">الخدمات الخمس الأعلى حجزًا</p>

          {stats.topServices.length === 0 ? (
            <EmptyState
              title="لا توجد بيانات كافية"
              message="ستظهر الخدمات الأكثر طلبًا بعد أول الحجوزات."
            />
          ) : (
            <>
              <div dir="ltr" className="mx-auto h-52 w-full max-w-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.topServices}
                      dataKey="count"
                      nameKey="name"
                      innerRadius="62%"
                      outerRadius="95%"
                      paddingAngle={4}
                      cornerRadius={6}
                      strokeWidth={0}
                    >
                      {stats.topServices.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-4 space-y-2.5">
                {stats.topServices.map((s, i) => (
                  <li
                    key={s.name}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="truncate font-semibold text-ink-700">
                        {s.name}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-bold text-ink-600 tabular-nums">
                      {s.count} ({topTotal ? Math.round((s.count / topTotal) * 100) : 0}%)
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </motion.section>
      </div>

      {/* الحجوزات القادمة */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="card-base p-5 sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink-900">
            الحجوزات القادمة
          </h2>
          <span className="rounded-full border border-ink-200 bg-ink-50 px-4 py-1.5 text-xs font-bold text-ink-500">
            أقرب {stats.upcoming.length} مواعيد
          </span>
        </div>

        {stats.upcoming.length === 0 ? (
          <EmptyState
            title="لا توجد حجوزات قادمة"
            message="ستظهر الحجوزات المؤكدة والقيد الانتظار هنا فور توفرها."
            calendar
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {stats.upcoming.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.06, duration: 0.4 }}
                className="group flex items-start gap-4 rounded-2xl border border-ink-100 bg-gradient-to-bl from-ink-50/60 to-white p-4 transition-all duration-300 hover:border-brand-200 hover:shadow-card"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700">
                  <ServiceIcon name={b.service.icon} className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="truncate font-display text-sm font-extrabold text-ink-900">
                      {b.patientName}
                    </h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 truncate text-xs font-semibold text-brand-700">
                    {b.service.name}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
                    <span className="font-semibold">{formatDateAr(b.date)}</span>
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 font-bold text-brand-700 tabular-nums">
                      {formatTime12(b.time)}
                    </span>
                    <a
                      href={`tel:${b.phone}`}
                      className="inline-flex items-center gap-1 font-bold text-ink-500 transition hover:text-brand-600"
                      dir="ltr"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {b.phone}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
