"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { containerStagger, fadeUp } from "@/lib/anim";

export default function StatementSection() {
  return (
    <section id="about" className="relative z-10 w-full bg-white -mt-6 md:-mt-8 lg:-mt-8 rounded-t-[20px] shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
      <motion.div
        className="max-w-6xl mx-auto px-8 py-28 text-center"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.div variants={fadeUp} className="flex justify-center mb-8">
          <Image src="/nature.svg" alt="Nature" width={200} height={100} />
        </motion.div>

        <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl lg:text-4xl font-medium text-[#0A438C] leading-snug mb-6">
          We believe healthcare should feel personal, not complicated. That’s
          <span className="text-gray-400">
            {" "}
            why our team is here to guide, support, and care for you — every
            step of the way. From prescriptions to everyday wellness, we make
            sure you always have what you need to stay healthy.
          </span>
        </motion.h2>
      </motion.div>
    </section>
  );
}
