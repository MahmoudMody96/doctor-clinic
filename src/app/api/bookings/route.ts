import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAvailability } from "@/lib/availability";
import { generateRefCode, normalizeDigits } from "@/lib/utils";

const bookingSchema = z.object({
  serviceId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تنسيق التاريخ غير صالح"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "تنسيق الوقت غير صالح"),
  patientName: z.string().trim().min(3, "الاسم قصير جدًا").max(80),
  phone: z
    .string()
    .transform((v) => normalizeDigits(v).replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^01[0125]\d{8}$/, "رقم الموبايل غير صحيح")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
        { status: 400 }
      );
    }
    const { serviceId, date, time, patientName, phone, notes } = parsed.data;

    const availability = await getAvailability(date, serviceId);
    if (!availability.slots.includes(time)) {
      return NextResponse.json(
        { error: "عذرًا، هذا الموعد لم يعد متاحًا. يرجى اختيار موعد آخر" },
        { status: 409 }
      );
    }

    let booking;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        booking = await prisma.booking.create({
          data: {
            refCode: generateRefCode(),
            patientName,
            phone,
            serviceId,
            date,
            time,
            notes: notes || null,
            status: "PENDING",
          },
          include: { service: true },
        });
        break;
      } catch (e: unknown) {
        const code = (e as { code?: string })?.code;
        if (code === "P2002" && attempt < 2) continue;
        throw e;
      }
    }
    if (!booking) throw new Error("failed to create booking");

    return NextResponse.json(
      {
        ok: true,
        refCode: booking.refCode,
        booking: {
          date: booking.date,
          time: booking.time,
          serviceName: booking.service.name,
          patientName: booking.patientName,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحجز، حاول مرة أخرى" },
      { status: 500 }
    );
  }
}
