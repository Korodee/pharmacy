"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { containerStagger, fadeUp } from "@/lib/anim";

type FAQ = { question: string; answer: string };

const faqs: FAQ[] = [
  {
    question: "Can I send a prescription to be prepared without having to wait in the pharmacy?",
    answer:
      "Yes! You can contact our team to send it by text message through our secured platform or you can send it through the Familiprix App.",
  },
  {
    question: "How can I access my file on the Familiprix App?",
    answer:
      "You download the App on Google Play or the App store, create an account with your information, select our pharmacy and request your personal key from our team to link to your medication's file. You can place an order, see your file, put reminders, send a picture of your prescription and much more!",
  },
  {
    question: "When is the pharmacy open?",
    answer:
      "We are open Monday to Thursday 9:00AM to 8:00PM, Friday 9:00 to 6:00PM and Saturday 9:30AM to 2:00PM. We are closed on Sunday",
  },
  {
    question: "What do I do to get my medication when you are closed?",
    answer:
      "You can get your prescription in our pharmacy in Lasalle, 9316 Airlie. Phone number: <a href='tel:+15143654155' class='text-blue-500 hover:underline'> (514) 365-4155</a>. They can have access to your file there as we are linked. If you don't want to cross the bridge, you can go to our pharmacy in St-Isidore, 640 Rang Saint-Régis. Phone number: <a href='tel:+14504545507' class='text-blue-500 hover:underline'> (450) 454-5507</a>",
  },
  {
    question: "How can I transfer my file to your pharmacy?",
    answer:
      "Come open your file at our pharmacy, give us the information of the pharmacy from where you want us to transfer and let us do the rest!",
  },
  {
    question: "Do we offer delivery?",
    answer:
      "Yes, during the week, we have 2 deliveries: one around noon and one in the evening around supper time. Saturday we have one delivery around noon.",
  },
  {
    question: "Can a pharmacist prescribe medication?",
    answer:
      "Yes! The pharmacist can prescribe medication either over the counter which can be covered by Health Canada or certain medication for certain conditions. Consult our list of <a href='/services' class='text-blue-500 hover:underline'>services</a> to learn more?",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full bg-white py-20">
      <motion.div
        className="max-w-5xl mx-auto px-6 md:px-10"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.h3 variants={fadeUp} className="text-center text-3xl md:text-4xl font-semibold text-[#0A438C] mb-10">
          Frequently Asked Questions
        </motion.h3>

        <div className="space-y-4">
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div key={i} className="rounded-[12px] border border-[#E6EEF7] bg-[#F1FAFD] overflow-hidden" variants={fadeUp}>
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
                    <div className="px-5 py-5 text-gray-500 text-md leading-6" dangerouslySetInnerHTML={{ __html: f.answer }}>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
