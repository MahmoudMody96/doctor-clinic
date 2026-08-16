import {
  Activity,
  Baby,
  CircleDot,
  Crown,
  Plus,
  Smile,
  Sparkles,
  Stethoscope,
  Sun,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Sun,
  CircleDot,
  Activity,
  Crown,
  Smile,
  Plus,
  Baby,
  Stethoscope,
};

export const SERVICE_ICON_NAMES = Object.keys(ICONS);

export default function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Stethoscope;
  return <Icon className={className} />;
}
