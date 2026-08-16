import type { AvailabilityResponse } from "@/types";

/** الحد الأقصى لطول الملاحظات (متوافق مع تحقق الخادم) */
export const NOTES_MAX = 500;

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** تحويل الأرقام اللاتينية إلى أرقام عربية مشرقية */
export function toArabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
}

/** صياغة المدة بصيغة عربية طبيعية: «٤٥ دقيقة» / «ساعة ونصف» */
export function durationLabelAr(minutes: number): string {
  if (minutes <= 0) return "";
  if (minutes < 60) return `${toArabicDigits(minutes)} دقيقة`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hoursLabel =
    hours === 1 ? "ساعة" : hours === 2 ? "ساعتان" : `${toArabicDigits(hours)} ساعات`;
  if (rest === 0) return hoursLabel;
  if (rest === 30) return `${hoursLabel} ونصف`;
  return `${hoursLabel} و${toArabicDigits(rest)} دقيقة`;
}

/** عدد المواعيد بصيغة عربية سليمة */
export function slotsCountAr(n: number): string {
  if (n === 1) return "موعد واحد";
  if (n === 2) return "موعدان";
  if (n >= 3 && n <= 10) return `${toArabicDigits(n)} مواعيد`;
  return `${toArabicDigits(n)} موعدًا`;
}

/** استجابة التوفر كما تصل فعليًا من الـ API (تشمل serviceMissing) */
export type AvailabilityData = AvailabilityResponse & { serviceMissing?: boolean };

/** حالة جلب التوفر داخل المعالج */
export type AvailabilityState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: AvailabilityData };

/** تجميع الفتحات إلى فترة صباحية ومسائية */
export interface SlotGroup {
  key: "morning" | "evening";
  title: string;
  slots: string[];
}

export function groupSlots(slots: string[]): SlotGroup[] {
  const morning = slots.filter((s) => Number(s.slice(0, 2)) < 12);
  const evening = slots.filter((s) => Number(s.slice(0, 2)) >= 12);
  const groups: SlotGroup[] = [];
  if (morning.length > 0)
    groups.push({ key: "morning", title: "الفترة الصباحية", slots: morning });
  if (evening.length > 0)
    groups.push({ key: "evening", title: "الفترة المسائية", slots: evening });
  return groups;
}

/** نتيجة نجاح الحجز القادمة من POST /api/bookings */
export interface BookingResult {
  refCode: string;
  booking: { date: string; time: string; serviceName: string; patientName: string };
}

/** حقول نموذج بيانات المريض */
export interface BookingFormState {
  name: string;
  phone: string;
  notes: string;
}
