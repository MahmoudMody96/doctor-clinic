import { prisma } from "./db";
import { minutesToTime, nowTimeCairo, timeToMinutes, todayCairo } from "./utils";

const SLOT_STEP = 30;
const MIN_LEAD_MINUTES = 60;

export interface SlotResult {
  slots: string[];
  offDay: boolean;
  blocked: boolean;
  past: boolean;
  serviceMissing: boolean;
}

/**
 * حساب المواعيد المتاحة لتاريخ وخدمة معينين:
 * يراعي مواعيد العمل والراحة اليومية والتواريخ المغلقة والحجوزات القائمة
 * ومدة الخدمة وعدم السماح بالحجز في الماضي.
 */
export async function getAvailability(
  date: string,
  serviceId: number
): Promise<SlotResult> {
  const empty: SlotResult = {
    slots: [],
    offDay: false,
    blocked: false,
    past: false,
    serviceMissing: false,
  };

  const service = await prisma.service.findFirst({
    where: { id: serviceId, isActive: true },
  });
  if (!service) return { ...empty, serviceMissing: true };

  const today = todayCairo();
  if (date < today) return { ...empty, past: true };

  const weekday = new Date(date + "T12:00:00").getDay();
  const rule = await prisma.scheduleRule.findUnique({
    where: { dayOfWeek: weekday },
  });
  if (!rule || !rule.isActive) return { ...empty, offDay: true };

  const blocked = await prisma.blockedDate.findUnique({ where: { date } });
  if (blocked) return { ...empty, blocked: true };

  const start = timeToMinutes(rule.startTime);
  const end = timeToMinutes(rule.endTime);
  const breakStart = rule.breakStart ? timeToMinutes(rule.breakStart) : null;
  const breakEnd = rule.breakEnd ? timeToMinutes(rule.breakEnd) : null;
  const duration = service.durationMin;

  const bookings = await prisma.booking.findMany({
    where: { date, status: { in: ["PENDING", "CONFIRMED"] } },
    include: { service: { select: { durationMin: true } } },
  });
  const busy = bookings.map((b) => ({
    start: timeToMinutes(b.time),
    end: timeToMinutes(b.time) + b.service.durationMin,
  }));

  const minStart =
    date === today ? timeToMinutes(nowTimeCairo()) + MIN_LEAD_MINUTES : -1;

  const slots: string[] = [];
  for (let t = start; t + duration <= end; t += SLOT_STEP) {
    if (
      breakStart !== null &&
      breakEnd !== null &&
      t < breakEnd &&
      t + duration > breakStart
    ) {
      continue;
    }
    if (busy.some((iv) => t < iv.end && t + duration > iv.start)) continue;
    if (t < minStart) continue;
    slots.push(minutesToTime(t));
  }

  return { slots, offDay: false, blocked: false, past: false, serviceMissing: false };
}
