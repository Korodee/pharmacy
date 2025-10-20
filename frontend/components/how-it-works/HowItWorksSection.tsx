"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { containerStagger, fadeUp } from "@/lib/anim";

type Step = {
  title: string;
  description: string;
  image: string;
  alt: string;
};

const steps: Step[] = [
  {
    title: "Request a Refill",
    description:
      "Choose the prescription number, add phone number, and select the medicines you want to refill.",
    image: "/request.png",
    alt: "Request a refill",
  },
  {
    title: "Get Notified When Ready",
    description:
      "You will receive a notification when your medications are ready with the pharmacist.",
    image: "/notify.png",
    alt: "Get notified",
  },
  {
    title: "Pickup/Doorstep Delivery",
    description:
      "We offer pickup and delivery options for your medications for greater convenience.",
    image: "/deliver.png",
    alt: "Pickup or delivery",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full bg-[#F1FAFD]">
      <motion.div
        className="max-w-7xl mx-auto px-6 md:px-10 py-20"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.h3 variants={fadeUp} className="text-center text-3xl md:text-4xl font-semibold text-[#0A438C] mb-12">
          How Our Refill Works
        </motion.h3>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="bg-white rounded-[18px] border border-[#E6EEF7] shadow-sm py-4 px-8 flex flex-col"
              variants={fadeUp}
            >
              <div className="flex justify-center mb-8">
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={240}
                  height={180}
                  className="w-56 h-40 object-contain"
                />
              </div>
              <h4 className="text-[#11122C] font-[400] text-xl mb-4">
                {step.title}
              </h4>
              <p className="text-[#11122C] font-[300] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
