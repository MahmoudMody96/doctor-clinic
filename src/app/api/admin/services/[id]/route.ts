import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().min(5).max(400).optional(),
  price: z.number().int().min(0).max(1_000_000).optional(),
  durationMin: z.number().int().min(15).max(240).optional(),
  icon: z.string().trim().max(50).optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const serviceId = Number(id);
  if (!Number.isInteger(serviceId)) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  try {
    const service = await prisma.service.update({
      where: { id: serviceId },
      data: parsed.data,
    });
    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const serviceId = Number(id);
  if (!Number.isInteger(serviceId)) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  const bookingsCount = await prisma.booking.count({
    where: { serviceId },
  });
  if (bookingsCount > 0) {
    return NextResponse.json(
      {
        error: `لا يمكن حذف الخدمة لوجود ${bookingsCount} حجز مرتبط بها. يمكنك تعطيلها بدلاً من الحذف`,
      },
      { status: 409 }
    );
  }

  try {
    await prisma.service.delete({ where: { id: serviceId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });
  }
}
