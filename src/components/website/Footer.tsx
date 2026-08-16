import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/Logo";
import type { ContentMap } from "@/types";

/** رموز سوشيال ميديا بأسلوب lucide (أُزيلت من lucide-react v1) */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const QUICK_LINKS = [
  { href: "#home", label: "الرئيسية" },
  { href: "#services", label: "الخدمات" },
  { href: "#about", label: "عن الطبيب" },
  { href: "#testimonials", label: "آراء المرضى" },
  { href: "#contact", label: "تواصل معنا" },
];

export default function Footer({ content }: { content: ContentMap }) {
  const year = new Date().getFullYear();
  const instagram = content.instagram ?? "";
  const facebook = content.facebook ?? "";

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-ink-300">
      {/* زخرفة خفيفة */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-1/3 h-72 w-72 rounded-full bg-brand-700/20 blur-3xl"
      />
      {/* خط متدرج أعلى الفوتر */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-brand-500/60 to-transparent"
      />

      <div className="container-x relative grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
        {/* الهوية */}
        <div>
          <Logo dark />
          <p className="mt-5 max-w-sm text-sm leading-8 text-ink-400">
            عيادة متكاملة لطب وتجميل الأسنان — نجمع بين الخبرة الطبية وأحدث
            التقنيات لنمنحك ابتسامة صحية تليق بك، في تجربة مريحة من أول زيارة.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="حساب إنستغرام"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-ink-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/50 hover:text-brand-300"
              >
                <InstagramIcon className="h-4.5 w-4.5" />
              </a>
            )}
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="صفحة فيسبوك"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-ink-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/50 hover:text-brand-300"
              >
                <FacebookIcon className="h-4.5 w-4.5" />
              </a>
            )}
          </div>
        </div>

        {/* روابط سريعة */}
        <nav aria-label="روابط سريعة">
          <h4 className="font-display text-sm font-extrabold uppercase tracking-wide text-white">
            روابط سريعة
          </h4>
          <ul className="mt-5 space-y-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group inline-flex items-center gap-2 text-sm text-ink-400 transition-colors hover:text-brand-300"
                >
                  <span className="h-1 w-1 rounded-full bg-brand-500 transition-all duration-300 group-hover:w-3" />
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/booking"
                className="group inline-flex items-center gap-2 text-sm font-bold text-brand-300 transition-colors hover:text-brand-200"
              >
                <span className="h-1 w-1 rounded-full bg-gold-400 transition-all duration-300 group-hover:w-3" />
                احجز موعدك
              </Link>
            </li>
          </ul>
        </nav>

        {/* تواصل مختصر */}
        <div>
          <h4 className="font-display text-sm font-extrabold uppercase tracking-wide text-white">
            تواصل معنا
          </h4>
          <ul className="mt-5 space-y-3.5 text-sm text-ink-400">
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-brand-400" />
              <a
                href={`tel:${(content.phone ?? "").replace(/\s/g, "")}`}
                dir="ltr"
                className="transition-colors hover:text-brand-300"
              >
                {content.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-brand-400" />
              <a
                href={`mailto:${content.email ?? ""}`}
                className="transition-colors hover:text-brand-300"
              >
                {content.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              <span className="leading-7">{content.address}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* الشريط السفلي */}
      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-500 sm:flex-row">
          <p>
            © {year} عيادة {content.doctor_name ?? "د. أحمد الشريف"} — جميع
            الحقوق محفوظة
          </p>
          <Link
            href="/admin"
            className="text-ink-600 transition-colors hover:text-brand-400"
          >
            دخول الإدارة
          </Link>
        </div>
      </div>
    </footer>
  );
}
