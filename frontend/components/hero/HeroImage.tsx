"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { slideInRight } from "@/lib/anim";

export default function HeroImage() {
  return (
    <motion.div
      className="relative w-full h-full flex items-end justify-center"
      variants={slideInRight}
      initial="hidden"
      animate="visible"
    >
      <div className="relative z-10">
        <Image
          src="/hero-img.png"
          alt="Professional pharmacist"
          width={1600}
          height={2000}
          className="object-contain object-bottom w-[110%] max-w-none"
          priority
        />
      </div>
    </motion.div>
  );
}
