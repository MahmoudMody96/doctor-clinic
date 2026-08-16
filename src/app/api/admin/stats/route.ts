import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { addDays, todayCairo } from "@/lib/utils";
import type { BookingDTO, BookingStatus, StatsResponse } from "@/types";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const today = todayCairo();
  const weekStart = addDays(today, -6);

  const [all, last14Raw, topRaw, upcomingRaw] = await Promise.all([
    prisma.booking.findMany({
      include: { service: { select: { id: true, name: true, price: true, durationMin: true, icon: true } } },
    }),
    prisma.booking.groupBy({
      by: ["date"],
      where: { date: { gte: addDays(today, -13) }, status: { not: "CANCELLED" } },
      _count: { date: true },
    }),
    prisma.booking.groupBy({
      by: ["serviceId"],
      where: { status: { not: "CANCELLED" } },
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: "desc" } },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { date: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } },
      include: { service: { select: { id: true, name: true, price: true, durationMin: true, icon: true } } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 8,
    }),
  ]);

  const totals: Record<BookingStatus, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };
  let revenue = 0;
  for (const b of all) {
    if (b.status in totals) totals[b.status as BookingStatus]++;
    if (b.status === "CONFIRMED" || b.status === "COMPLETED") {
      revenue += b.service.price;
    }
  }

  const last14Map = new Map(last14Raw.map((r) => [r.date, r._count.date]));
  const last14: StatsResponse["last14"] = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDays(today, -i);
    last14.push({ date: d, count: last14Map.get(d) ?? 0 });
  }

  const serviceIds = topRaw.map((t) => t.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, name: true },
  });
  const serviceName = new Map(services.map((s) => [s.id, s.name]));
  const topServices = topRaw.map((t) => ({
    name: serviceName.get(t.serviceId) ?? "غير معروف",
    count: t._count.serviceId,
  }));

  const upcoming: BookingDTO[] = upcomingRaw.map((b) => ({
    id: b.id,
    refCode: b.refCode,
    patientName: b.patientName,
    phone: b.phone,
    service: b.service,
    date: b.date,
    time: b.time,
    status: b.status as BookingStatus,
    notes: b.notes,
    createdAt: b.createdAt.toISOString(),
  }));

  const stats: StatsResponse = {
    totals,
    todayCount: all.filter((b) => b.date === today && b.status !== "CANCELLED").length,
    weekCount: all.filter(
      (b) => b.date >= weekStart && b.date <= today && b.status !== "CANCELLED"
    ).length,
    totalActive: totals.PENDING + totals.CONFIRMED,
    revenue,
    last14,
    topServices,
    upcoming,
  };

  return NextResponse.json(stats);
}
