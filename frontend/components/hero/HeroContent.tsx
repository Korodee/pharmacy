"use client";
import { HeroContent as HeroContentType } from "@/lib/data/heroData";
import Button from "./Button";
import { motion } from "framer-motion";
import { containerStagger, fadeUp } from "@/lib/anim";

interface HeroContentProps {
  content: HeroContentType;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export default function HeroContent({ content, isModalOpen, setIsModalOpen }: HeroContentProps) {
  return (
    <motion.div
      className="max-w-2xl mt-[40px] md:my-0"
      variants={containerStagger}
      initial="hidden"
      animate="visible"
    >
      {/* Primary Heading */}
      <motion.h1 variants={fadeUp} className="text-center text-4xl md:text-6xl lg:text-6xl font-medium text-white leading-tight mb-5">
        {content.primaryHeading}
      </motion.h1>

      {/* Secondary Heading */}
      <motion.h2 variants={fadeUp} className="text-center text-4xl md:text-[49px] font-medium text-primary-200 mb-6">
        {content.secondaryHeading}
      </motion.h2>

      {/* Description */}
      <motion.p variants={fadeUp} className="text-xl text-center font-light md:text-2xl text-[#D4F4FF] mb-16 leading-relaxed">
        {content.description}
      </motion.p>

      {/* Buttons */}
      <motion.div variants={fadeUp} className="flex justify-center flex-col sm:flex-row gap-4">
        {content.buttons.map((button, index) => (
          <Button key={index} button={button} className="text-center" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        ))}
      </motion.div>
    </motion.div>
  );
}
