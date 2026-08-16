/** عنوان موحّد أعلى محتوى كل خطوة */
export default function StepHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-xl font-extrabold text-ink-900 sm:text-2xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1.5 text-sm leading-7 text-ink-500">{subtitle}</p>
      )}
    </div>
  );
}
