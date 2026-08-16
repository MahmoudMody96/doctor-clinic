"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { fadeUp, staggerContainer, viewportOnce } from "./reveal";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "كيف أحجز موعدي؟",
    a: "اضغط زر «احجز الآن» في أعلى الصفحة، اختر الخدمة المناسبة، ثم حدّد اليوم والوقت المتاح من التقويم. ستستلم كود حجز فوريًا خلال أقل من دقيقة — بدون أي مكالمات هاتفية.",
  },
  {
    q: "هل علاج الأسنان مؤلم؟",
    a: "نستخدم تخديرًا موضعيًا لطيفًا وتقنيات ليزر حديثة تقلل الإحساس بالألم بشكل كبير. أغلب مرضانا يفاجَؤون بأن الجلسة كانت مريحة تمامًا من البداية حتى النهاية.",
  },
  {
    q: "كم تكلّف الجلسات؟",
    a: "لكل خدمة سعر معلن بوضوح في قسم الخدمات بجانب مدتها، بدون أي رسوم خفية. وبعد الفحص الأولي تستلم خطة علاج تفصيلية بالتكلفة الكاملة قبل البدء بأي خطوة.",
  },
  {
    q: "كم تستغرق الجلسة الواحدة؟",
    a: "تتراوح مدة الجلسة بين 30 و60 دقيقة حسب نوع الخدمة، وستجد المدة الدقيقة مذكورة بجانب كل خدمة. نحترم وقتك ونلتزم بمواعيدنا بدقة.",
  },
  {
    q: "هل توجد متابعة بعد العلاج؟",
    a: "نعم، نتواصل معك بعد الإجراءات المهمة للاطمئنان على حالتك، وأي متابعة خلال أسبوعين من العلاج مجانية تمامًا. راحتك بعد الجلسة جزء من العلاج نفسه.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-pad relative overflow-hidden bg-gradient-to-b from-white via-brand-50/50 to-white">
      <div className="container-x relative">
        <SectionHeading
          eyebrow="الأسئلة الشائعة"
          title="عندك سؤال؟"
          highlight="عندنا الإجابة"
          subtitle="جمعنا أكثر الأسئلة التي تصلنا من مرضانا وأجبنا عليها بوضوح — وإن لم تجد سؤالك راسلنا مباشرة."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mx-auto mt-12 max-w-3xl space-y-4"
        >
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={item.q}
                variants={fadeUp}
                className={`card-base overflow-hidden transition-shadow duration-300 ${
                  isOpen ? "shadow-soft" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                        isOpen
                          ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow"
                          : "bg-brand-50 text-brand-700"
                      }`}
                    >
                      <MessageCircleQuestion className="h-4.5 w-4.5" />
                    </span>
                    <span className="font-display text-sm font-extrabold text-ink-900 sm:text-base">
                      {item.q}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-brand-600 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-ink-100 px-6 pb-6 pt-4 text-sm leading-8 text-ink-600">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
