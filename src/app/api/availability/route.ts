import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  const serviceId = Number(req.nextUrl.searchParams.get("serviceId"));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(serviceId) || serviceId <= 0) {
    return NextResponse.json(
      { error: "معاملات غير صالحة (date و serviceId مطلوبان)" },
      { status: 400 }
    );
  }

  const result = await getAvailability(date, serviceId);
  return NextResponse.json(result);
}
