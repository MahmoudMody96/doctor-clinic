"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  type LucideIcon,
} from "lucide-react";
import type { ContentMap } from "@/types";
import SectionHeading from "./SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "./reveal";

/** بناء رابط واتساب صحيح من الرقم المخزَّن */
function waLink(raw: string): string {
  let n = raw.replace(/[^\d]/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  else if (n.startsWith("0")) n = `20${n.slice(1)}`;
  return `https://wa.me/${n}`;
}

interface ContactCard {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  href: string;
  external: boolean;
  ltr: boolean;
}

export default function Contact({ content }: { content: ContentMap }) {
  const phone = content.phone ?? "";
  const whatsapp = content.whatsapp ?? "";
  const email = content.email ?? "";
  const address = content.address ?? "";
  const mapUrl = content.map_url ?? "";
  const hours = content.working_hours_text ?? "";

  const cards: ContactCard[] = [
    {
      icon: Phone,
      label: "اتصل بنا",
      value: phone,
      hint: "اضغط للاتصال المباشر",
      href: `tel:${phone.replace(/\s/g, "")}`,
      external: false,
      ltr: true,
    },
    {
      icon: MessageCircle,
      label: "واتساب",
      value: whatsapp,
      hint: "راسلنا في أي وقت",
      href: waLink(whatsapp),
      external: true,
      ltr: true,
    },
    {
      icon: Mail,
      label: "البريد الإلكتروني",
      value: email,
      hint: "نرد خلال 24 ساعة",
      href: `mailto:${email}`,
      external: false,
      ltr: true,
    },
    {
      icon: MapPin,
      label: "العنوان",
      value: address,
      hint: mapUrl ? "افتح الموقع على الخريطة" : "تفضل بزيارتنا",
      href: mapUrl || "#contact",
      external: Boolean(mapUrl),
      ltr: false,
    },
  ];

  return (
    <section
      id="contact"
      className="section-pad scroll-mt-20 relative overflow-hidden bg-white"
    >
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-brand-100/70 blur-3xl"
      />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="تواصل معنا"
          title="يسعدنا خدمتك"
          highlight="في أي وقت"
          subtitle="فريقنا جاهز للرد على استفساراتك وحجز موعدك — اختر طريقة التواصل الأنسب لك."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-5 sm:grid-cols-2"
        >
          {cards.map((card) => (
            <motion.a
              key={card.label}
              variants={fadeUp}
              href={card.href}
              target={card.external ? "_blank" : undefined}
              rel={card.external ? "noopener noreferrer" : undefined}
              className={`card-base group flex items-start gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft ${
                card.label === "العنوان" && !mapUrl ? "pointer-events-none opacity-70" : ""
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
                <card.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-extrabold text-ink-500">
                  {card.label}
                </span>
                <span
                  dir={card.ltr ? "ltr" : "rtl"}
                  className={`mt-1 block truncate font-display text-lg font-extrabold text-ink-900 ${
                    card.ltr ? "text-end sm:text-start" : ""
                  }`}
                  title={card.value}
                >
                  {card.value}
                </span>
                <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600">
                  {card.external && (
                    <ExternalLink className="h-3.5 w-3.5" />
                  )}
                  {card.hint}
                </span>
              </span>
            </motion.a>
          ))}

          {/* بطاقة مواعيد العمل */}
          <motion.div
            variants={fadeUp}
            className="card-base relative flex flex-col gap-4 overflow-hidden p-6 sm:col-span-2"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-brand-50"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-800 to-ink-950 text-gold-400 shadow-soft">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-ink-500">
                    مواعيد العمل
                  </p>
                  <p className="mt-1 font-display text-base font-extrabold text-ink-900">
                    {hours}
                  </p>
                </div>
              </div>
              <Link
                href="/booking"
                className="group inline-flex items-center gap-2 rounded-full border-2 border-brand-600 px-6 py-2.5 text-sm font-extrabold text-brand-700 transition-all duration-300 hover:bg-brand-600 hover:text-white"
              >
                <CalendarCheck className="h-4 w-4" />
                احجز ضمن المواعيد المتاحة
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
