"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { containerStagger, fadeUp } from "@/lib/anim";

type Service = {
  title: string;
  description: string;
  image: string;
  alt: string;
};

const services: Service[] = [
  {
    title: "Smoking <br /> Cessation",
    description:
      "Free patches, gums, lozenges, and inhalers to help you quit smoking with professional support.",
    image: "/smoke.jpg",
    alt: "Smoking cessation",
  },
  {
    title: "Sinus <br /> Infection",
    description:
      "Professional assessment and antibiotic treatment for sinus infections lasting more than 7 days.",
    image: "/sinus.jpg",
    alt: "Sinus infection",
  },
  {
    title: "Heartburn & <br /> Indigestion",
    description:
      "Expert assessment and treatment for heartburn, acid reflux, and digestive discomfort.",
    image: "/heart-burn.jpg",
    alt: "Heartburn and indigestion",
  },
  {
    title: "Seasonal <br /> Allergies",
    description:
      "Professional relief from seasonal allergy symptoms with personalized treatment plans.",
    image: "/seasonal-allergy.jpg",
    alt: "Seasonal allergy treatment",
  },
  {
    title: "Mild <br /> Acne",
    description:
      "Professional treatment options for mild acne conditions with personalized care.",
    image: "/acne.jpg",
    alt: "Mild acne treatment",
  },
  {
    title: "Tick <br /> Bite",
    description:
      "Quick assessment and antibiotic treatment to prevent Lyme disease after tick bites.",
    image: "/tick-bite.jpg",
    alt: "Tick bite treatment",
  },
];

export default function ServicesSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    const bar = progressRef.current as HTMLDivElement | null;
    if (!el || !bar) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const pct = max > 0 ? (el.scrollLeft / max) * 100 : 0;
      bar.style.width = `${pct}%`;
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <section id="services" className="w-full bg-white">
      <motion.div
        className="max-w-6xl mx-auto px-6 md:px-10 py-20"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.h3 variants={fadeUp} className="text-center text-3xl md:text-4xl font-semibold text-[#0A438C] mb-10">
        Discover our healthcare services
        </motion.h3>

        {/* Horizontal scroll with snap; card layout: image left, text right */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex gap-6 w-max">
              {services.map((s, i) => (
                <motion.article
                  key={i}
                  className="snap-start bg-[#F7FAFE] p-4 rounded-[18px] border border-[#E6EEF7] shadow-sm flex flex-col md:flex-row min-w-[280px] h-auto md:h-[280px] max-w-[120px] md:max-w-[450px] overflow-hidden"
                  variants={fadeUp}
                >
                  {/* Image - Top on mobile, left on desktop */}
                  <div className="w-full md:w-[160px] rounded-xl h-[200px] md:h-full shrink-0">
                    <Image
                      src={s.image}
                      alt={s.alt}
                      width={320}
                      height={240}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Text - Below image on mobile, right on desktop */}
                  <div className="flex flex-col h-full mt-4 md:mt-0">
                    <h4 className="text-[#0A438C] py-2 px-2 md:px-6 font-semibold text-[19px] leading-snug">
                      <span dangerouslySetInnerHTML={{ __html: s.title }} />
                    </h4>
                    <p className="text-[#11122C] px-2 md:pl-6 font-[300] text-[13px] leading-relaxed max-w-[360px] mt-auto pb-2 md:pb-2">
                      {s.description}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          {/* Custom scroll progress bar */}
          <div className="relative mt-6 h-[3px] bg-[#EEF3FA] rounded-full">
            <div ref={progressRef} className="absolute left-0 top-0 h-[3px] rounded-full bg-gradient-to-r from-[#0A438C] to-[#0A7BB2]" style={{ width: '0%' }} />
          </div>
        </div>

        {/* View All Services Button */}
        <motion.div 
          variants={fadeUp}
          className="flex justify-center mt-8"
        >
          <motion.a
            href="/services"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 bg-[#0A438C] text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-[#0A438C]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            View All Services
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.a>
        </motion.div>

      </motion.div>
    </section>
  );
}
