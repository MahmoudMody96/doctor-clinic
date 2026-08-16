import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { BookingStatus } from "@/types";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status");
  const date = req.nextUrl.searchParams.get("date");
  const q = req.nextUrl.searchParams.get("q");

  const where: Record<string, unknown> = {};
  if (status && ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) {
    where.status = status;
  }
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    where.date = date;
  }
  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { patientName: { contains: term } },
      { phone: { contains: term } },
      { refCode: { contains: term } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: { service: true },
    orderBy: [{ date: "desc" }, { time: "desc" }],
    take: 500,
  });

  return NextResponse.json(
    bookings.map((b) => ({
      ...b,
      status: b.status as BookingStatus,
      createdAt: b.createdAt.toISOString(),
    }))
  );
}
