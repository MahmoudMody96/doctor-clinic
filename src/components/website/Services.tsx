"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import ServiceIcon from "@/components/ServiceIcon";
import type { ServiceDTO } from "@/types";
import { formatPrice } from "@/lib/utils";
import SectionHeading from "./SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "./reveal";

export default function Services({ services }: { services: ServiceDTO[] }) {
  return (
    <section id="services" className="section-pad scroll-mt-20 bg-white">
      <div className="container-x">
        <SectionHeading
          eyebrow="خدماتنا"
          title="علاجات متكاملة"
          highlight="بأحدث التقنيات"
          subtitle="من التنظيف والتبييض إلى الزراعة والتقويم — اختر الخدمة المناسبة واحجز موعدك مباشرة، بأسعار معلنة ومدة واضحة لكل جلسة."
        />

        {services.length === 0 ? (
          <div className="card-base mx-auto mt-14 max-w-xl p-10 text-center">
            <p className="font-display text-lg font-extrabold text-ink-900">
              قائمة الخدمات تُحدَّث قريبًا
            </p>
            <p className="mt-2 text-sm text-ink-600">
              يمكنك من الآن حجز موعد عام وسنرشدك للخدمة الأنسب لحالتك.
            </p>
            <Link href="/booking" className="btn-primary mt-6 text-sm">
              احجز موعدًا عامًا
            </Link>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((service) => (
              <motion.article
                key={service.id}
                variants={fadeUp}
                className="card-base group relative flex flex-col p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-soft"
              >
                {/* خط علوي متدرج يظهر عند hover */}
                <span
                  aria-hidden
                  className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-l from-brand-500 to-gold-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="mb-5 flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <ServiceIcon name={service.icon} className="h-7 w-7" />
                  </span>
                  <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-extrabold text-brand-700">
                    {formatPrice(service.price)}
                  </span>
                </div>

                <h3 className="font-display text-lg font-extrabold text-ink-900 transition-colors group-hover:text-brand-700">
                  {service.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-ink-600">
                  {service.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-600">
                    <Clock className="h-4 w-4 text-brand-600" />
                    {service.durationMin} دقيقة
                  </span>
                  <Link
                    href={`/booking?service=${service.id}`}
                    className="inline-flex items-center gap-1 text-sm font-extrabold text-brand-700 transition-colors hover:text-brand-500"
                  >
                    احجز هذه الخدمة
                    <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
