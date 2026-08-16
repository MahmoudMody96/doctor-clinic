import type { Metadata, Viewport } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: {
    default: "د. أحمد الشريف | عيادة طب وتجميل الأسنان",
    template: "%s | عيادة د. أحمد الشريف",
  },
  description:
    "عيادة متكاملة لطب وتجميل الأسنان — حجز إلكتروني سهل، أحدث التقنيات الألمانية، وأكثر من 15 عامًا من الخبرة. ابتسامتك تستحق الأفضل.",
  keywords: [
    "طبيب أسنان",
    "عيادة أسنان",
    "تبييض الأسنان",
    "تقويم",
    "زراعة الأسنان",
    "حجز دكتور أسنان",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${tajawal.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
