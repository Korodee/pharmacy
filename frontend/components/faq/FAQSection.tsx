"use client";
import { useState } from "react";

type FAQ = { question: string; answer: string };

const faqs: FAQ[] = [
  {
    question: "How do I refill my prescription online?",
    answer:
      "Use the Request A Refill button at the top of the page. Upload a photo or enter your RX number and contact details.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Local deliveries are typically completed the same day if placed before 2:00 PM. Otherwise, next business day.",
  },
  {
    question: "What are your available hours?",
    answer:
      "We’re open Monday–Friday, 9:00 AM–8:00 PM, and Saturday, 9:00 AM–2:00 PM. Closed on Sundays. Online orders and uploads are available anytime.",
  },
  {
    question: "Can I order medicines without a prescription?",
    answer:
      "Over‑the‑counter items can be ordered without a prescription. Prescription medications require a valid RX or doctor transfer.",
  },
  {
    question: "Where are your pharmacies located?",
    answer:
      "Our pharmacies in LaSalle and St‑Isidore are open 7 days per week:\n- 9316 Airlie (corner 90th Ave), LaSalle, T514‑365‑4155\n- 640 Rue St‑Regis, St‑Isidore, T450‑454‑5507",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full bg-white py-20">
      <div className="max-w-5xl mx-auto px-6 md:px-10">
        <h3 className="text-center text-3xl md:text-4xl font-semibold text-[#0A438C] mb-10">
          Frequently Asked Questions
        </h3>

        <div className="space-y-4">
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="rounded-[12px] border border-[#E6EEF7] bg-[#F1FAFD] overflow-hidden">
                <button
                  className="w-full flex items-center justify-between text-left px-5 py-4 text-[17px] text-[#0A438C] font-medium"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span>{f.question}</span>
                  <svg
                    className={`h-5 w-5 text-[#0A438C] transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  } bg-white`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 py-5 text-gray-500 text-md leading-6">
                      {f.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
