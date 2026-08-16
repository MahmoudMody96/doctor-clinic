import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "./jwt";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** يُستخدم في بداية أي مسار API خاص بالإدارة — يرد 401 أو الجلسة */
export async function requireAdmin(): Promise<
  { session: SessionPayload; error: null } | { session: null; error: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "جلسة غير صالحة، يرجى تسجيل الدخول" }, { status: 401 }),
    };
  }
  return { session, error: null };
}
