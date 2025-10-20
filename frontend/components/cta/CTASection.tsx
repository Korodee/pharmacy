"use client";
import Image from "next/image";
import { useState } from "react";
import RefillModal from "../modal/RefillModal";
import { motion } from "framer-motion";
import { containerStagger, fadeUp } from "@/lib/anim";

export default function CTASection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <section className="w-full bg-white py-12">
      <div className="px-4">
        <motion.div
          className="relative rounded-2xl bg-[#F1FAFD] border border-[#E6EEF7] overflow-hidden"
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Text Section */}
          <div className="relative z-10 px-6 md:px-10 pt-[88px] pb-[18rem] text-center">
            <motion.h3 variants={fadeUp} className="text-[#0A438C] text-3xl md:text-5xl font-semibold leading-tight mb-6">
              Your Health, Our Priority. Refill,
              <br className="hidden md:block" /> Shop, Or Consult Today.
            </motion.h3>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-[16px] max-w-md mx-auto mb-8">
              Access trusted medications, refills, and expert guidance from
              licensed pharmacists — all in one place.
            </motion.p>
            <motion.button
              variants={fadeUp}
              onClick={() => setIsModalOpen(true)}
              className="inline-block bg-[#0A438C] text-white px-14 py-4 rounded-xl font-semibold hover:bg-[#0A438C]/90 transition-colors"
            >
              Request A Refill
            </motion.button>
          </div>

          {/* Background Image */}
          <div className="absolute bottom-0 left-0 w-full h-full">
            <Image
              src="/cta-bg.png"
              alt="CTA decorative background"
              fill
              className="object-cover object-bottom"
              sizes="100vw"
              priority
            />
          </div>
        </motion.div>
      </div>
      
      <RefillModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
