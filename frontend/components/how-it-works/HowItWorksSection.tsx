"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { containerStagger, fadeUp } from "@/lib/anim";
import { useState } from "react";

type Step = {
  title: string;
  description: string;
  image: string;
  alt: string;
};

const steps: Step[] = [
  {
    title: "Refill now on our website",
    description: "Request A Refill",
    image: "/request.png",
    alt: "Website refill",
  },
  {
    title: "To access your file, request a key from our team",
    description: "Download the App",
    image: "/download-app.png",
    alt: "App download",
  },
  {
    title: "For pick up or Delivery?",
    description: "Call to order now",
    image: "/phone-icon-new.png",
    alt: "Phone order",
  },
];

interface HowItWorksSectionProps {
  onRefillClick?: () => void;
}

export default function HowItWorksSection({ onRefillClick }: HowItWorksSectionProps) {
  const handleButtonClick = (description: string) => {
    if (description === "Request A Refill") {
      onRefillClick?.();
    } else if (description === "Download the App") {
      // Detect device type and redirect accordingly
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      
      if (isIOS) {
        // iPhone/iPad users go to App Store
        window.open("https://apps.apple.com/ca/app/familiprix/id932510029", "_blank");
      } else if (isAndroid) {
        // Android users go to Google Play Store
        window.open("https://play.google.com/store/search?q=familiprix&c=apps&hl=en", "_blank");
      } else {
        // Default to App Store for other devices
        window.open("https://apps.apple.com/ca/app/familiprix/id932510029", "_blank");
      }
    } else if (description === "Call to order now") {
      window.location.href = "tel:4506385760";
    }
    // Add other button handlers here if needed
  };

  return (
    <section id="how-it-works" className="relative z-10 w-full bg-[#F1FAFD] -mt-6 md:-mt-6 lg:-mt-6 rounded-t-[20px] shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
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
              className="bg-white rounded-[18px] border border-[#E6EEF7] shadow-sm py-8 px-6 flex flex-col items-center text-center h-full"
              variants={fadeUp}
            >
              <div className="flex justify-center mb-6">
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={240}
                  height={180}
                  className="w-56 h-40 object-contain"
                />
              </div>
              <h4 className={`text-[#0A438C] font-medium text-lg mb-6 flex-grow text-center ${
                step.title === "Refill now on our website" || step.title === "For pick up or Delivery?" 
                  ? "mt-2" 
                  : ""
              }`}>
                {step.title}
              </h4>
              <button 
                onClick={() => handleButtonClick(step.description)}
                className="bg-white border-2 border-[#0A438C] text-[#0A438C] px-6 py-3 rounded-lg font-medium hover:bg-[#0A438C] hover:text-white transition-all duration-200 mt-auto"
              >
                {step.description}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
