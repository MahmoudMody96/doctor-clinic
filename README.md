# 🦷 عيادة الشريف — موقع طبيب أسنان متكامل

موقع احترافي لعيادة طب وتجميل الأسنان مع نظام حجز إلكتروني كامل ولوحة تحكم إدارية — عربي بالكامل (RTL).

## ✨ المميزات

### الموقع العام
- صفحة رئيسية فاخرة بأنيميشن احترافي (Framer Motion)
- الخدمات والأسعار ديناميكية من قاعدة البيانات
- آراء المرضى، الأسئلة الشائعة، معلومات التواصل
- نظام حجز إلكتروني من 5 خطوات (خدمة ← يوم ← وقت ← بيانات ← تأكيد)
- فحص التوفر اللحظي مع منع الحجز المزدوج ومراعاة مدة كل خدمة

### لوحة التحكم `/admin`
- تسجيل دخول محمي (JWT + httpOnly cookie)
- نظرة عامة بإحصائيات ورسوم بيانية (Recharts)
- إدارة الحجوزات (تأكيد / إتمام / إلغاء / حذف + بحث وفلترة)
- إدارة مواعيد العمل الأسبوعية والتواريخ المغلقة (إجازات)
- إدارة الخدمات والأسعار
- تعديل محتوى الموقع (بيانات الطبيب، التواصل، السوشيال)

## 🛠️ التقنيات

| الطبقة | التقنية |
|---|---|
| الواجهة | Next.js 15 (App Router) + React 19 + TypeScript |
| التنسيق | Tailwind CSS v4 |
| الأنيميشن | Framer Motion |
| الرسوم البيانية | Recharts |
| قاعدة البيانات | SQLite + Prisma ORM |
| المصادقة | jose (JWT) + bcryptjs |

## 🚀 التشغيل

```bash
npm install
npx prisma migrate dev     # إنشاء قاعدة البيانات
npx tsx prisma/seed.ts     # بيانات تجريبية (اختياري)
npm run dev                # http://localhost:3000
```

## 🔑 بيانات الدخول للوحة التحكم

```
اسم المستخدم: admin
كلمة المرور:  admin123
```

> ⚠️ غيّرها قبل النشر الفعلي (جدول Admin في قاعدة البيانات — كلمة المرور مشفرة bcrypt).

## 📁 هيكل المشروع

```
src/
├── app/
│   ├── page.tsx              # الصفحة الرئيسية
│   ├── booking/              # نظام الحجز
│   ├── admin/                # لوحة التحكم (محمية بـ middleware)
│   └── api/                  # مسارات API
├── components/
│   ├── website/              # أقسام الموقع العام
│   ├── booking/              # مكونات الحجز
│   └── admin/                # مكونات لوحة التحكم
├── lib/                      # db, auth, availability, utils
└── types/                    # الأنواع المشتركة
prisma/                       # schema + seed
```

## 🧠 منطق المواعيد

- كل خدمة لها مدة جلسة خاصة (30-90 دقيقة)
- المواعيد المتاحة = مواعيد العمل − فترة الراحة − الحجوزات القائمة − الماضي
- لا يمكن حجز نفس الفترة مرتين (حتى لخدمات مختلفة المدة)
- حد أدنى ساعة قبل موعد نفس اليوم

---

## 🚢 النشر على Coolify (الإنتاج — PostgreSQL)

النسخة الإنتاجية تستخدم `prisma/schema.prod.prisma` (PostgreSQL) بدل SQLite المحلية.

**إعدادات التطبيق في Coolify:**

| الإعداد | القيمة |
|---|---|
| Build Pack | Nixpacks |
| Build Command | `npm run build:prod` |
| Start Command | `npm run start:prod` |
| Health Check Path | `/api/health` |
| Health Check Host | `127.0.0.1` |

**متغيرات البيئة المطلوبة:**

```
DATABASE_URL=postgresql://user:pass@<db-container>:5432/clinic
AUTH_SECRET=<مفتاح عشوائي طويل>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<كلمة مرور قوية>
NODE_ENV=production
```

- `SEED_DEMO=true` اختياري لزرع حجوزات تجريبية (لجدول فارغ فقط)
- البذر آمن تمامًا: يعمل عند كل إقلاع ولا يستبدل أي بيانات عدّلتها من لوحة التحكم
- التطبيق والقاعدة يجب أن يكونا على شبكة `coolify` نفسها (`connect_to_docker_network: true`)
- الدومين بصيغة `https://` إلزامي لشهادة Let's Encrypt

## 🌐 النسخة الحية

| | |
|---|---|
| **الرابط** | https://doctor.169.58.65.43.sslip.io |
| **اللوحة** | https://doctor.169.58.65.43.sslip.io/admin |
| المستودع | github.com/MahmoudMody96/doctor-clinic |
| Coolify | مشروع `Doctor-Clinic` — `doctor-web` + `doctor-db` (PostgreSQL 16) |

**التحديث بعد أي تعديل:** `git push` ← Coolify بينشر تلقائيًا من فرع main (Webhook GitHub مفعل).
