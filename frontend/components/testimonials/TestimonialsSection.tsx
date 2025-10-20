"use client";
import Image from "next/image";

type Testimonial = {
  quote: string;
  name: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Ordering online was so convenient. My prescription was ready the same day — very reliable service.",
    name: "Kà:hi Tékeni",
    avatar: "/client-1.svg",
  },
  {
    quote:
      "Kateri Pharmacy is my first choice now. The pharmacist actually called to confirm my refill. I was impressed.",
    name: "Tióhsa Kenwà:ra",
    avatar: "/client-2.svg",
  },
  {
    quote:
      "I got my medication with no hassle. Pickup was quick, and they were kind throughout.",
    name: "Wáhi Kanón",
    avatar: "/client-1.svg",
  },
  {
    quote:
      "Ordering online was so convenient. My prescription was ready the same day — very reliable service.",
    name: "Kà:hi Tékeni",
    avatar: "/client-1.svg",
  },
  {
    quote:
      "Kateri Pharmacy is my first choice now. The pharmacist actually called to confirm my refill. I was impressed.",
    name: "Tióhsa Kenwà:ra",
    avatar: "/client-2.svg",
  },
];

export default function TestimonialsSection() {
  const loop = [...testimonials, ...testimonials];
  return (
    <section id="reviews" className="w-full bg-[#F1FAFD]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
        <h3 className="text-center text-3xl md:text-4xl font-semibold text-[#0A438C] mb-10">
          What Client Says About Us
        </h3>

        <div className="relative overflow-hidden">
          <div className="flex gap-6 w-max will-change-transform animate-[marquee_30s_linear_infinite]">
            {loop.map((t, i) => (
              <article
                key={i}
                className="bg-transparent rounded-[14px] border border-[#E6EEF7] p-6 md:p-8 flex flex-col justify-between max-w-[280px] md:max-w-[380px]"
              >
                <p className="text-[#11122C] text-[17px] leading-6 mb-6">
                  {t.quote}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280] text-sm">{t.name}</span>
                  <Image
                    src={t.avatar}
                    alt={`${t.name} avatar`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>
    </section>
  );
}
