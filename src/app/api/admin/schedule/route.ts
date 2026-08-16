import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const rulesSchema = z.array(
  z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(timeRegex),
    endTime: z.string().regex(timeRegex),
    breakStart: z.string().regex(timeRegex).nullable().optional(),
    breakEnd: z.string().regex(timeRegex).nullable().optional(),
    isActive: z.boolean(),
  })
);

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [rules, blocked] = await Promise.all([
    prisma.scheduleRule.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.blockedDate.findMany({ orderBy: { date: "asc" } }),
  ]);
  return NextResponse.json({ rules, blocked });
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = rulesSchema.safeParse(body?.rules);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "بيانات المواعيد غير صالحة" },
      { status: 400 }
    );
  }

  for (const rule of parsed.data) {
    await prisma.scheduleRule.update({
      where: { dayOfWeek: rule.dayOfWeek },
      data: {
        startTime: rule.startTime,
        endTime: rule.endTime,
        breakStart: rule.breakStart ?? null,
        breakEnd: rule.breakEnd ?? null,
        isActive: rule.isActive,
      },
    });
  }

  const rules = await prisma.scheduleRule.findMany({ orderBy: { dayOfWeek: "asc" } });
  return NextResponse.json({ ok: true, rules });
}
