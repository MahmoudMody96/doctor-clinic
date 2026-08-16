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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://doctor.169.58.65.43.sslip.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "د. أحمد الشريف | عيادة طب وتجميل الأسنان",
    template: "%s | عيادة د. أحمد الشريف",
  },
  description:
    "عيادة متكاملة لطب وتجميل الأسنان — حجز إلكتروني سهل، أحدث التقنيات الألمانية، وأكثر من 15 عامًا من الخبرة. ابتسامتك تستحق الأفضل.",
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "/",
    siteName: "عيادة د. أحمد الشريف",
    title: "د. أحمد الشريف | عيادة طب وتجميل الأسنان",
    description:
      "حجز إلكتروني في أقل من دقيقة — تنظيف، تبييض، تقويم، زراعة وتجميل الأسنان بأحدث التقنيات الألمانية.",
  },
  twitter: {
    card: "summary_large_image",
    title: "د. أحمد الشريف | عيادة طب وتجميل الأسنان",
    description: "حجز إلكتروني في أقل من دقيقة — ابتسامتك تستحق الأفضل.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: { canonical: "/" },
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
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:right-3 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-extrabold focus:text-brand-700 focus:shadow-soft"
        >
          تخطَّ إلى المحتوى الرئيسي
        </a>
        {children}
      </body>
    </html>
  );
}
