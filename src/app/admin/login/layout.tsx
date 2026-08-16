import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل دخول الإدارة",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
