"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { containerStagger, fadeUp } from "@/lib/anim";

export default function Footer() {
  return (
    <footer className="w-full bg-white">
      <motion.div
        className="max-w-7xl mx-auto px-6 md:px-10 py-12"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="flex flex-col gap-6 md:gap-10">
          {/* Top row: logo + helper text */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <motion.div variants={fadeUp}>
            <Image
              src="/logo.svg"
              alt="Kateri Pharmacy"
              width={200}
              height={48}
            />
            </motion.div>
            <motion.p variants={fadeUp} className="text-[14px] text-gray-600 md:w-[50%] md:text-right">
              Do you need answers to your queries while ordering medicines
              online? Want to refill your prescription by phone? Our customer
              service specialists will be happy to assist you.
            </motion.p>
          </div>
          {/* Contacts */}
          <div className="block text-[14px] text-gray-600 md:hidden space-y-1">
            <p>
              Call{" "}
              <Link href="tel:4506385760" className="text-[#0A438C] underline">
                450 638 5760
              </Link>{" "}
              now and we will get in touch with you.
            </p>
            <p>
              Our Fax number is{" "}
              <Link href="tel:4506358249" className="text-[#0A438C] underline">
                450‑635‑8249
              </Link>
            </p>
          </div>

          <div className="grid mt-6 md:grid-cols-3 gap-8 text-[14px] text-gray-600">
            {/* Address 1 */}
            <motion.div variants={fadeUp} className="flex items-start gap-3">
              <svg
                className="h-6 w-6 text-[#0A438C] flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22s7-6.1 7-12a7 7 0 10-14 0c0 5.9 7 12 7 12z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              <div>
                <p>
                  9316 Airlie (corner 90th ave), LaSalle, T514‑365‑4155
                  <span className="text-[#0A438C] underline ml-2">
                    (Open 7 days a week)
                  </span>
                </p>
                <p className="mt-2 flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-[#0A438C]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path
                      d="M9 7c1.2-1.2 2.6-2 4.1-2h.4c-.6.5-1.1 1.1-1.3 1.7-.2.5-.6.8-1.1.9-.7.2-1.3.6-1.7 1.2L9 9.5V7z"
                      fill="white"
                    />
                    <path
                      d="M12 12c-1 .2-1.8.6-2 .9-.4.5-.4 1.3.1 1.9l1.4 1.6c.6.7 1 1.6 1 2.5v.3c1.7-.4 3.3-1.3 4.5-2.6l-.7-1c-.4-.5-1-.8-1.6-.9-.8-.1-1.4-.6-1.7-1.3l-.2-.4-.8-1z"
                      fill="white"
                    />
                  </svg>
                  <Link
                    href="https://www.familiprix.com/en/pharmacies/fadi-chamoun-spiros-marinis-et-azat-basarini-eaf84a6d-a003-473f-98c7-338a2408a2a8"
                    className="text-[#0A438C] underline"
                  >
                    Familiprix LaSalle
                  </Link>
                </p>
              </div>
            </motion.div>

            {/* Address 2 */}
            <motion.div variants={fadeUp} className="flex items-start gap-3">
              <svg
                className="h-6 w-6 text-[#0A438C] flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22s7-6.1 7-12a7 7 0 10-14 0c0 5.9 7 12 7 12z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              <div>
                <p>
                  640 Rue St‑Regis, St‑Isidore, T450‑454‑5507
                  <span className="text-[#0A438C] underline ml-2">
                    (Open 7 days a week)
                  </span>
                </p>
                <p className="mt-2 flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-[#0A438C]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path
                      d="M9 7c1.2-1.2 2.6-2 4.1-2h.4c-.6.5-1.1 1.1-1.3 1.7-.2.5-.6.8-1.1.9-.7.2-1.3.6-1.7 1.2L9 9.5V7z"
                      fill="white"
                    />
                    <path
                      d="M12 12c-1 .2-1.8.6-2 .9-.4.5-.4 1.3.1 1.9l1.4 1.6c.6.7 1 1.6 1 2.5v.3c1.7-.4 3.3-1.3 4.5-2.6l-.7-1c-.4-.5-1-.8-1.6-.9-.8-.1-1.4-.6-1.7-1.3l-.2-.4-.8-1z"
                      fill="white"
                    />
                  </svg>
                  <Link
                    href="https://www.familiprix.com/en/pharmacies/jean-david-parent-fadi-chamoun-et-spiros-marinis-525ef0be-5fa9-4529-a2e3-b6b56c70412b"
                    className="text-[#0A438C] underline"
                  >
                    Familiprix St‑Isidore‑de‑Laprairie
                  </Link>
                </p>
              </div>
            </motion.div>

            {/* Contacts */}
            <motion.div variants={fadeUp} className="hidden md:block md:text-right space-y-1">
              <p>
                Call{" "}
                <Link
                  href="tel:4506385760"
                  className="text-[#0A438C] underline"
                >
                  450 638 5760
                </Link>{" "}
                now and we will get in touch with you.
              </p>
              <p>
                Our Fax number is{" "}
                <Link
                  href="tel:4506358249"
                  className="text-[#0A438C] underline"
                >
                  450‑635‑8249
                </Link>
              </p>
            </motion.div>
          </div>

          <hr className="border-[#E6EEF7]" />

          {/* Bottom row: copyright */}
          <motion.div variants={fadeUp} className="text-[#6B7280] text-center text-sm">
            © 2025 Kateri Pharmacy. All Rights Reserved.
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}
