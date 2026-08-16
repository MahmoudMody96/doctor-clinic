import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import { getContent } from "@/lib/content";
import type { ContentMap } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description:
    "كيف تجمع عيادة د. أحمد الشريف بيانات المرضى وتحميها — الاسم ورقم الهاتف والملاحظات فقط، ولأغراض الحجز والتواصل حصريًا.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    title: "البيانات التي نجمعها",
    body: "عند الحجز الإلكتروني نجمع ثلاث بيانات فقط: الاسم، ورقم الموبايل، وملاحظات اختيارية تكتبها أنت لنا. لا نجمع أي بيانات صحية أو مالية عبر الموقع، ولا نطلب أي دفع إلكتروني — الدفع يتم في العيادة وقت الزيارة.",
  },
  {
    title: "لماذا نجمعها",
    body: "نستخدم بياناتك لغرض واحد: إدارة حجزك — تأكيد الموعد، التواصل معك عند الحاجة لتعديله أو إلغائه، ومناداتك عند الاستقبال. لا نستخدمها لأي أغراض تسويقية ولا نرسل لك رسائل إعلانية.",
  },
  {
    title: "من يراها",
    body: "بياناتك متاحة فقط للطبيب وفريق الاستقبال في العيادة. لا نشاركها ولا نبيعها لأي طرف ثالث بأي حال، ولا يوجد أي ربط بينها وبين أي جهة خارجية.",
  },
  {
    title: "مدة الحفظ",
    body: "نحتفظ ببيانات الحجز للمدة اللازمة لإدارة مواعيدك وسجلات العيادة وفق الأصول الطبية. يمكنك طلب حذف بياناتك في أي وقت.",
  },
  {
    title: "حقوقك",
    body: "لك الحق في معرفة البيانات المحفوظة عنك، وتصحيحها، أو حذفها نهائيًا. اطلب ذلك عبر واتساب أو الاتصال بنا واذكر رقمك المرجعي — سنستجيب خلال 48 ساعة كحد أقصى.",
  },
  {
    title: "أمان الموقع",
    body: "يُنقل الموقع عبر اتصال مشفر (HTTPS)، وكلمات مرور لوحة الإدارة مشفرة بالكامل، ولا يمكن الوصول لبيانات الحجوزات إلا بعد تسجيل دخول مصرّح به.",
  },
  {
    title: "الإطار القانوني",
    body: "تلتزم العيادة بأحكام قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020 وما يصدر من قرارات تنفيذية بشأنه.",
  },
];

export default async function PrivacyPage() {
  const raw = await getContent();
  const content: ContentMap = {
    doctor_name: "د. أحمد الشريف",
    phone: "01012345678",
    whatsapp: "201012345678",
    email: "info@dr-ahmed-clinic.com",
    address: "",
    instagram: "",
    facebook: "",
    ...raw,
  };

  return (
    <>
      <Navbar />
      <main id="main" className="pb-24 pt-32 sm:pt-36">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-brand-50/80 to-transparent" />
        <div className="container-x max-w-3xl">
          <header className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-extrabold text-brand-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              خصوصيتك أمانة
            </span>
            <h1 className="mt-5 font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">
              سياسة الخصوصية
            </h1>
            <p className="mt-4 text-sm leading-8 text-ink-600 sm:text-base">
              نجمع أقل قدر ممكن من البيانات — بالقدر الذي يلزم لإدارة حجزك
              فقط. هذه السياسة بلغة واضحة بلا تعقيد قانوني.
            </p>
          </header>

          <div className="mt-10 space-y-4">
            {SECTIONS.map((section, i) => (
              <section
                key={section.title}
                className="card-base p-6 sm:p-7"
              >
                <h2 className="flex items-center gap-3 font-display text-lg font-extrabold text-ink-900">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-black text-brand-700" aria-hidden>
                    {i + 1}
                  </span>
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-8 text-ink-700">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <p className="mt-8 text-center text-xs leading-7 text-ink-500">
            آخر تحديث: أغسطس 2026 — لأي استفسار عن الخصوصية تواصل معنا عبر
            الهاتف {content.phone} أو البريد {content.email}
          </p>
        </div>
      </main>
      <Footer content={content} />
    </>
  );
}
