import { prisma } from "./db";
import type { ContentMap } from "@/types";

/** قراءة محتوى الموقع القابل للتعديل كخريطة مفتاح/قيمة */
export async function getContent(): Promise<ContentMap> {
  const rows = await prisma.siteContent.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
