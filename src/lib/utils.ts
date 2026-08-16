import type { BookingStatus } from "@/types";

export const DAY_NAMES_AR = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

export const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-teal-100 text-teal-800 border-teal-200",
  COMPLETED: "bg-sky-100 text-sky-800 border-sky-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

/** تحويل الأرقام العربية ٠-٩ إلى إنجليزية */
export function normalizeDigits(input: string): string {
  return input.replace(/[\u0660-\u0669]/g, (d) =>
    String(d.charCodeAt(0) - 0x0660)
  );
}

export function isValidEgyptianPhone(input: string): boolean {
  return /^01[0125]\d{8}$/.test(normalizeDigits(input).replace(/[\s-]/g, ""));
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatPrice(n: number): string {
  return `${n.toLocaleString("en-US")} ج.م`;
}

/** "14:30" → "2:30 م" */
export function formatTime12(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? "ص" : "م";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** "2026-08-17" → "الإثنين 17 أغسطس 2026" */
export function formatDateAr(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = DAY_NAMES_AR[d.getDay()];
  return `${day} ${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`;
}

/** التاريخ الحالي بتوقيت القاهرة بصيغة YYYY-MM-DD */
export function todayCairo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(
    new Date()
  );
}

/** الوقت الحالي بتوقيت القاهرة بصيغة HH:mm */
export function nowTimeCairo(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateRefCode(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `DC-${digits}`;
}
