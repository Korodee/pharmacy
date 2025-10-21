"use client";
import { heroData } from "@/lib/data/heroData";
import Logo from "./Logo";
import Navigation from "./Navigation";
import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";
import { useState, useEffect } from "react";
import RefillModal from "../modal/RefillModal";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <section
      id="home"
      className="relative h-[100svh] md:h-screen bg-cover bg-center bg-no-repeat overflow-visible"
      style={{ backgroundImage: "url(/hero-bg.png)" }}
    >
      {/* Background Image with proper loading */}
      <div className="absolute inset-0">
        <img
          src="/hero-bg.png"
          alt=""
          className="w-full h-full object-cover"
          style={{ 
            filter: 'blur(1px)',
            transform: 'scale(1.02)'
          }}
          loading="eager"
        />
      </div>
      {/* Background Overlay */}
      <div className="absolute inset-0"></div>

      {/* Navigation Header */}
      <header className="relative z-20 px-4 pt-8 lg:px-8">
        {/* Fixed centered nav */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <Navigation items={heroData.navigation} isModalOpen={isModalOpen} />
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          {/* Left: Logo */}
          <Logo />

          {/* Right: CTA (white bg, gradient border, text #0A438C) - Hidden on mobile */}
          <div className="justify-self-end hidden md:block">
            <div className="p-[1.6px] rounded-[15px] bg-[linear-gradient(90deg,#0A438C,#0A7BB2)]">
              <button
                onClick={() => setIsModalOpen(true)}
                className="block bg-white text-[#0A438C] px-6 py-3 text-base font-medium hover:bg-gray-50 transition-colors duration-200 rounded-[12px]"
              >
                {heroData.ctaButton.text}
              </button>
            </div>
          </div>

          {/* Mobile Burger Menu - Fixed position */}
          <div className="md:hidden fixed top-6 right-6 z-50">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-3 rounded-full transition-all duration-300 ${
                isScrolled
                  ? "bg-[#0A438C] border border-[#0A438C] shadow-lg"
                  : "bg-transparent"
              }`}
            >
              <div className="w-4 h-4 flex flex-col justify-center items-center">
                <span
                  className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-1" : ""
                  }`}
                ></span>
                <span
                  className={`block w-6 h-0.5 bg-white mt-1 transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`block w-6 h-0.5 bg-white mt-1 transition-all duration-300 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-1" : ""
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <div className="relative z-10 px-4 py-2 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="min-h-[80vh] flex items-center justify-center">
            {/* Content - Centered on mobile, half on desktop */}
            <div className="flex items-center justify-center w-full lg:w-auto">
              <HeroContent
                content={heroData.content}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
              />
            </div>

            {/* Right Image - Hidden on mobile */}
            {/* <div className="hidden lg:flex items-center justify-center">
              <HeroImage />
            </div> */}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 200,
                duration: 0.4 
              }}
              className="absolute top-0 right-0 w-72 h-full bg-white shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="flex items-center justify-between p-6 border-b border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </motion.div>

                {/* Navigation Links */}
                <nav className="flex-1 px-6 py-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="space-y-2"
                  >
                    {heroData.navigation.map((item, index) => (
                      <motion.a
                        key={index}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ 
                          delay: 0.3 + (index * 0.1), 
                          duration: 0.3 
                        }}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-4 rounded-xl text-base font-medium text-gray-700 hover:bg-[#0A438C]/5 hover:text-[#0A438C] transition-all duration-200 group"
                      >
                        <span className="flex items-center justify-between">
                          {item.label}
                          <svg
                            className="w-4 h-4 text-gray-400 group-hover:text-[#0A438C] transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </motion.a>
                    ))}
                  </motion.div>
                </nav>

                {/* Footer with CTA */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="p-6 border-t border-gray-100 bg-gray-50/50"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-[#0A438C] text-white px-6 py-4 rounded-xl text-base font-semibold hover:bg-[#0A438C]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Request A Refill
                  </motion.button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Quick and easy prescription refills
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RefillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
