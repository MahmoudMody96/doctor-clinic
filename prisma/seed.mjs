// بذر آمن للإنتاج والتطوير — يعمل عند كل إقلاع ولا يلمس أي بيانات موجودة:
// - الأدمن: upsert (من متغيرات البيئة ADMIN_USERNAME/ADMIN_PASSWORD أو admin/admin123)
// - مواعيد الأسبوع والمحتوى: upsert على مفاتيح ثابتة
// - الخدمات: تُزرع فقط إذا كان الجدول فارغًا
// - حجوزات تجريبية: فقط مع SEED_DEMO=true وجدول فارغ
//
// التشغيل: node prisma/seed.mjs   (يتطلب أن يكون prisma db push/migrate قد شُغّل قبله)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const seedDemo = process.env.SEED_DEMO === "true";

async function main() {
  console.log("🌱 seed: بدء (آمن — لا يلمس البيانات الموجودة)");

  // ── الأدمن ──────────────────────────────────────────────
  await prisma.admin.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      passwordHash: bcrypt.hashSync(adminPassword, 10),
      displayName: "د. أحمد الشريف",
    },
  });

  // ── مواعيد العمل الأسبوعية (الجمعة إجازة) ─────────────────
  for (let day = 0; day <= 6; day++) {
    await prisma.scheduleRule.upsert({
      where: { dayOfWeek: day },
      update: {},
      create: {
        dayOfWeek: day,
        startTime: "10:00",
        endTime: "21:00",
        breakStart: "14:00",
        breakEnd: "17:00",
        isActive: day !== 5,
      },
    });
  }

  // ── المحتوى الافتراضي (upsert: لا يستبدل قيمًا عدّلها الأدمن) ──
  const content = {
    doctor_name: "د. أحمد الشريف",
    doctor_title: "استشاري طب وتجميل الأسنان",
    hero_badge: "عيادة متكاملة لطب وتجميل الأسنان",
    hero_title: "ابتسامتك تستحق الأفضل",
    hero_subtitle:
      "أكثر من 15 عامًا من الخبرة في طب وتجميل الأسنان بأحدث التقنيات الألمانية وأجواء مريحة خالية من الألم.",
    experience_years: "15",
    patients_count: "12000",
    reviews_count: "850",
    rating: "4.9",
    about_short:
      "حاصل على ماجستير طب الفم والأسنان من جامعة القاهرة، وزمالة الكلية الملكية للجراحين بإدنبرة، مع أكثر من 15 عامًا من الخبرة وآلاف الابتسامات الناجحة.",
    phone: "01012345678",
    whatsapp: "201012345678",
    email: "info@dr-ahmed-clinic.com",
    address: "شارع التحرير، وسط البلد، القاهرة",
    map_url: "https://maps.google.com/?q=Cairo+Tahrir+Square",
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    working_hours_text: "السبت - الخميس: 10ص - 2م و 5م - 9م | الجمعة: إجازة",
  };
  for (const [key, value] of Object.entries(content)) {
    await prisma.siteContent.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  // ── الخدمات: فقط لجدول فارغ ─────────────────────────────
  const servicesCount = await prisma.service.count();
  if (servicesCount === 0) {
    const services = [
      { name: "تنظيف وتلميع الأسنان", description: "إزالة الجير والتصبغات وتلميع الأسنان لأحدث درجة من النظافة واللمعان.", price: 500, durationMin: 30, icon: "Sparkles", sortOrder: 1 },
      { name: "تبييض الأسنان بالليزر", description: "تبييض آمن ومتقدم بالليزر يمنحك ابتسامة أكثر إشراقًا خلال جلسة واحدة.", price: 1500, durationMin: 60, icon: "Sun", sortOrder: 2 },
      { name: "حشو تجميلي (كومبوزيت)", description: "حشوات بلون الأسنان الطبيعي بمواد ألمانية عالية الجودة تدوم لسنوات.", price: 400, durationMin: 45, icon: "CircleDot", sortOrder: 3 },
      { name: "علاج الجذور (عصب)", description: "علاج عصب بدون ألم بأحدث أجهزة الـ Rotary وأشعة رقمية دقيقة.", price: 1200, durationMin: 90, icon: "Activity", sortOrder: 4 },
      { name: "تركيبات الزيركون", description: "تيجان وجسور زيركون ألماني بضمان 10 سنوات ومظهر مطابق تمامًا للأسنان الطبيعية.", price: 2500, durationMin: 60, icon: "Crown", sortOrder: 5 },
      { name: "تقويم الأسنان", description: "خطة تقويم شاملة (عدسات أو ثابت) مع متابعة دورية حتى تمام العلاج.", price: 8000, durationMin: 60, icon: "Smile", sortOrder: 6 },
      { name: "زراعة الأسنان", description: "زراعة فورية بأنظمة كورية وسويسرية مع ضمان مدى الحياة على الزرعة.", price: 7000, durationMin: 90, icon: "Plus", sortOrder: 7 },
      { name: "أسنان الأطفال", description: "رعاية متكاملة لأسنان الأطفال في أجواء مرحة وخالية من الخوف.", price: 300, durationMin: 30, icon: "Baby", sortOrder: 8 },
    ];
    for (const s of services) await prisma.service.create({ data: s });
    console.log(`seed: أُضيفت ${services.length} خدمات`);
  }

  // ── حجوزات تجريبية: فقط بطلب صريح وجدول فارغ ─────────────
  if (seedDemo && (await prisma.booking.count()) === 0) {
    const today = new Date();
    const d = (offset) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + offset);
      return dt.toISOString().slice(0, 10);
    };
    const svc = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });
    const demo = [
      { patientName: "محمود عبد الرحمن", phone: "01098765432", s: 1, date: d(1), time: "11:00", status: "CONFIRMED" },
      { patientName: "سارة أحمد", phone: "01123456789", s: 0, date: d(1), time: "12:30", status: "PENDING" },
      { patientName: "خالد إبراهيم", phone: "01234567890", s: 3, date: d(2), time: "18:00", status: "CONFIRMED" },
      { patientName: "منى حسن", phone: "01555555555", s: 4, date: d(3), time: "19:00", status: "PENDING" },
      { patientName: "عمر فتحي", phone: "01011112222", s: 2, date: d(-1), time: "11:30", status: "COMPLETED" },
    ];
    let i = 0;
    for (const b of demo) {
      if (!svc[b.s]) continue;
      await prisma.booking.create({
        data: {
          refCode: `DC-${100001 + i++}`,
          patientName: b.patientName,
          phone: b.phone,
          serviceId: svc[b.s].id,
          date: b.date,
          time: b.time,
          status: b.status,
        },
      });
    }
    console.log("seed: أُضيفت حجوزات تجريبية");
  }

  console.log("✅ seed: انتهى بنجاح");
}

main()
  .catch((e) => {
    console.error("seed فشل:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
