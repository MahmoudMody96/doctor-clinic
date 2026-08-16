import { Suspense } from "react";
import type { Metadata } from "next";
import { BadgeCheck, MessageCircle, Sparkles, Wallet } from "lucide-react";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import BookingWizard from "@/components/booking/BookingWizard";
import { getContent } from "@/lib/content";
import { prisma } from "@/lib/db";
import type { ContentMap } from "@/types";

/** ضمان جلب محتوى حديث من قاعدة البيانات في كل طلب */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "حجز موعد إلكتروني",
  description:
    "احجز موعدك في عيادة د. أحمد الشريف لطب وتجميل الأسنان خلال أقل من دقيقة — اختر الخدمة واليوم والوقت المناسب وسنؤكد حجزك فورًا برقم مرجعي.",
};

/** قيم افتراضية لمفاتيح المحتوى التي يحتاجها الفوتر وواتساب */
const CONTENT_DEFAULTS: ContentMap = {
  doctor_name: "د. أحمد الشريف",
  phone: "01012345678",
  whatsapp: "201012345678",
  email: "info@elsherif-dental.com",
  address: "القاهرة — مصر",
  instagram: "",
  facebook: "",
};

const TRUST_POINTS = [
  { icon: BadgeCheck, label: "تأكيد فوري برقم مرجعي" },
  { icon: Wallet, label: "بدون أي دفع مقدم" },
  { icon: MessageCircle, label: "تعديل أو إلغاء عبر واتساب" },
];

const SKELETON =
  "animate-shimmer rounded-full bg-gradient-to-l from-ink-100 via-ink-50 to-ink-100 bg-[length:200%_100%]";

/** هيكل تحميل يظهر أثناء تجهيز المعالج */
function WizardFallback() {
  return (
    <div
      className="card-base p-6 sm:p-8"
      aria-busy="true"
      aria-label="جارٍ تحميل نموذج الحجز"
    >
      <div className="mx-auto flex max-w-xl items-start justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={`${SKELETON} h-10 w-10`} />
            <div className={`${SKELETON} h-2.5 w-10`} />
          </div>
        ))}
      </div>
      <div className={`${SKELETON} mx-auto mt-10 h-6 w-48`} />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-shimmer rounded-2xl bg-gradient-to-l from-ink-50 via-white to-ink-50 bg-[length:200%_100%]"
          />
        ))}
      </div>
    </div>
  );
}

export default async function BookingPage() {
  const rawContent = await getContent();
  const content: ContentMap = { ...CONTENT_DEFAULTS, ...rawContent };

  // أيام الأسبوع المقفولة (لتعطيلها مباشرة في خطوة اختيار اليوم)
  const offRules = await prisma.scheduleRule.findMany({
    where: { isActive: false },
    select: { dayOfWeek: true },
  });
  const offDays = offRules.map((r) => r.dayOfWeek);

  return (
    <>
      <Navbar />
      <main id="main" className="relative overflow-hidden pb-24 pt-32 sm:pt-36">
        {/* زخارف خلفية ناعمة */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-[15%] h-80 w-80 rounded-full bg-brand-100/70 blur-3xl" />
          <div className="absolute -top-10 right-[5%] h-64 w-64 rounded-full bg-gold-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-[30%] h-72 w-72 rounded-full bg-ink-100/60 blur-3xl" />
        </div>

        <div className="container-x">
          <header className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-extrabold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              حجز إلكتروني — أقل من دقيقة
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl">
              احجز <span className="text-gradient">موعدك</span> بكل سهولة
            </h1>
            <p className="mt-4 text-sm leading-8 text-ink-500 sm:text-base">
              خمس خطوات بسيطة تفصلك عن ابتسامة أكثر صحة وإشراقًا — اختر
              الخدمة، حدّد الوقت المناسب، وسنعتني بالباقي.
            </p>
          </header>

          <div className="mx-auto mt-10 max-w-4xl sm:mt-12">
            <Suspense fallback={<WizardFallback />}>
              <BookingWizard
                whatsapp={content.whatsapp ?? "201012345678"}
                offDays={offDays}
                address={content.address ?? ""}
                mapUrl={content.map_url ?? "#"}
              />
            </Suspense>

            <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {TRUST_POINTS.map((point) => (
                <li
                  key={point.label}
                  className="flex items-center gap-2 text-xs font-bold text-ink-600"
                >
                  <point.icon className="h-4 w-4 text-brand-600" />
                  {point.label}
                </li>
              ))}
            </ul>

            <p className="mt-5 text-center text-xs text-ink-600">
              تفضّل التواصل المباشر؟{" "}
              <a
                href={`https://wa.me/${content.whatsapp ?? "201012345678"}?text=${encodeURIComponent(
                  "مرحبًا، أريد الاستفسار عن حجز موعد في العيادة"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition-colors hover:text-emerald-800"
              >
                راسلنا على واتساب
              </a>{" "}
              وسنحجز لك بأنفسنا.
            </p>
          </div>
        </div>
      </main>
      <Footer content={content} />
    </>
  );
}
