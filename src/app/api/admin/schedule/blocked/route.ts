import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const blockedSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تنسيق التاريخ غير صالح"),
  reason: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const parsed = blockedSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  try {
    const blocked = await prisma.blockedDate.create({
      data: { date: parsed.data.date, reason: parsed.data.reason || null },
    });
    return NextResponse.json(blocked, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "هذا التاريخ مغلق بالفعل" },
      { status: 409 }
    );
  }
}
