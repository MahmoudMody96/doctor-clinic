import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const bookingId = Number(id);
  if (!Number.isInteger(bookingId)) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  const body = await req.json();
  if (!VALID_STATUSES.includes(body?.status)) {
    return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
  }

  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: body.status },
      include: { service: true },
    });
    return NextResponse.json({
      ...booking,
      createdAt: booking.createdAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const bookingId = Number(id);
  if (!Number.isInteger(bookingId)) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  try {
    await prisma.booking.delete({ where: { id: bookingId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 });
  }
}
