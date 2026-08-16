import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const blockedId = Number(id);
  if (!Number.isInteger(blockedId)) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  try {
    await prisma.blockedDate.delete({ where: { id: blockedId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
  }
}
