import { getContent } from "@/lib/content";
import { prisma } from "@/lib/db";
import type { ContentMap } from "@/types";
import Navbar from "@/components/website/Navbar";
import Hero from "@/components/website/Hero";
import Services from "@/components/website/Services";
import About from "@/components/website/About";
import WhyUs from "@/components/website/WhyUs";
import Testimonials from "@/components/website/Testimonials";
import Faq from "@/components/website/Faq";
import CtaBanner from "@/components/website/CtaBanner";
import Contact from "@/components/website/Contact";
import Footer from "@/components/website/Footer";

/** ضمان جلب بيانات حديثة من قاعدة البيانات في كل طلب */
export const dynamic = "force-dynamic";

/** قيم افتراضية تُستخدم فقط إذا كان أحد مفاتيح المحتوى مفقودًا من قاعدة البيانات */
const CONTENT_DEFAULTS: ContentMap = {
  doctor_name: "د. أحمد الشريف",
  doctor_title: "استشاري طب وتجميل الأسنان",
  hero_badge: "عيادة متكاملة لطب وتجميل الأسنان",
  hero_title: "ابتسامتك تستحق الأفضل",
  hero_subtitle:
    "أكثر من 15 عامًا من الخبرة وأحدث التقنيات الألمانية، لنمنحك ابتسامة صحية تليق بك — احجز موعدك في أقل من دقيقة بدون مكالمات.",
  experience_years: "15",
  patients_count: "12000",
  reviews_count: "850",
  rating: "4.9",
  about_short:
    "د. أحمد الشريف — استشاري طب وتجميل الأسنان، حاصل على زمالة كلية الجراحين الملكية بإدنبرة وماجستير من جامعة القاهرة. خلال رحلته المهنية عالج أكثر من 12 ألف مريض، ويؤمن أن طب الأسنان فن قبل أن يكون علومًا: خطة علاج دقيقة، وتنفيذ بإتقان، وابتسامة تدوم.",
  phone: "01012345678",
  whatsapp: "201012345678",
  email: "info@elsherif-dental.com",
  address: "القاهرة — مصر",
  map_url: "",
  instagram: "",
  facebook: "",
  working_hours_text: "السبت – الخميس: 10 صباحًا – 9 مساءً",
};

export default async function Home() {
  const [services, rawContent] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    getContent(),
  ]);

  const content: ContentMap = { ...CONTENT_DEFAULTS, ...rawContent };

  return (
    <>
      <Navbar />
      <main>
        <Hero content={content} />
        <Services services={services} />
        <About content={content} />
        <WhyUs />
        <Testimonials />
        <Faq />
        <CtaBanner />
        <Contact content={content} />
      </main>
      <Footer content={content} />
    </>
  );
}
