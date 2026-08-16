import Link from "next/link";

/** شعار العيادة: سنّة داخل دائرة متدرجة + اسم العيادة */
export default function Logo({
  dark = false,
  compact = false,
}: {
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow transition-transform group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-white"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2.5c-2.1 0-2.9.9-4.5.9-2.3 0-4 2.1-4 4.6 0 1.9.8 3.3 1.4 4.7.6 1.5 1 3.3 1.2 5.5.1 1.1.7 2.3 1.9 2.3 1.5 0 1.8-1.5 2.1-3 .3-1.4.6-2.9 1.9-2.9s1.6 1.5 1.9 2.9c.3 1.5.6 3 2.1 3 1.2 0 1.8-1.2 1.9-2.3.2-2.2.6-4 1.2-5.5.6-1.4 1.4-2.8 1.4-4.7 0-2.5-1.7-4.6-4-4.6-1.6 0-2.4-.9-4.5-.9z" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span
            className={`block font-display text-lg font-extrabold ${
              dark ? "text-white" : "text-ink-900"
            }`}
          >
            عيادة الشريف
          </span>
          <span className="block text-[11px] font-medium text-brand-600">
            طب وتجميل الأسنان
          </span>
        </span>
      )}
    </Link>
  );
}
