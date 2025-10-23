"use client";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { containerStagger, fadeUp } from "@/lib/anim";
import { useRef } from "react";

interface StatementSectionProps {
  customText?: string;
}

export default function StatementSection({
  customText,
}: StatementSectionProps = {}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Create progressive text highlighting
  const text1Progress = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const text2Progress = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  const text3Progress = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const text4Progress = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const text5Progress = useTransform(scrollYProgress, [0.8, 1], [0, 1]);

  return (
    <section id="about" className="bg-white ">
      <motion.div
        ref={ref}
        className="max-w-6xl mx-auto px-8 py-28 text-center"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.div variants={fadeUp} className="flex justify-center mb-8">
          <Image src="/nature.svg" alt="Nature" width={200} height={100} />
        </motion.div>

        <motion.h2 className="text-2xl md:text-3xl lg:text-4xl font-medium leading-snug mb-6">
          {customText ? (
            <>
              {customText.split(" ").map((word, index) => {
                const progress =
                  index === 0
                    ? text1Progress
                    : index < 8
                    ? text2Progress
                    : index < 16
                    ? text3Progress
                    : index < 24
                    ? text4Progress
                    : text5Progress;

                return (
                  <motion.span
                    key={index}
                    style={{
                      color: useTransform(
                        progress,
                        [0, 1],
                        ["#6B7280", "#0A438C"]
                      ),
                    }}
                  >
                    {word}
                    {index < customText.split(" ").length - 1 ? " " : ""}
                  </motion.span>
                );
              })}
            </>
          ) : (
            <>
              <motion.span
                style={{
                  color: useTransform(
                    text1Progress,
                    [0, 1],
                    ["#6B7280", "#0A438C"]
                  ),
                }}
              >
                We believe healthcare should feel personal, not complicated.
                That's
              </motion.span>
              <motion.span
                style={{
                  color: useTransform(
                    text2Progress,
                    [0, 1],
                    ["#6B7280", "#0A438C"]
                  ),
                }}
              >
                {" "}
                why our team is here to guide, support, and care for you — every
              </motion.span>
              <motion.span
                style={{
                  color: useTransform(
                    text3Progress,
                    [0, 1],
                    ["#6B7280", "#0A438C"]
                  ),
                }}
              >
                {" "}
                step of the way. From prescriptions to everyday wellness, we
                make
              </motion.span>
              <motion.span
                style={{
                  color: useTransform(
                    text4Progress,
                    [0, 1],
                    ["#6B7280", "#0A438C"]
                  ),
                }}
              >
                {" "}
                sure you always have what you need to stay healthy.
              </motion.span>
            </>
          )}
        </motion.h2>
      </motion.div>
    </section>
  );
}
