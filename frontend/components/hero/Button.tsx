"use client";
import { HeroButton } from "@/lib/data/heroData";
import { useState } from "react";
import RefillModal from "../modal/RefillModal";

interface ButtonProps {
  button: HeroButton;
  className?: string;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export default function Button({ button, className = "", isModalOpen, setIsModalOpen }: ButtonProps) {
  const rounded = "rounded-[20px]";

  const handleClick = () => {
    if (button.text === "Request A Refill") {
      setIsModalOpen(true);
    } else if (button.text === "Learn More") {
      // Scroll to section
      const element = document.querySelector("#how-it-works");
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {button.variant === "primary" ? (
        // White button with blue text
        <button
          onClick={handleClick}
          className={`block bg-white text-[#0A438C] px-10 py-4 ${rounded} text-xl font-400 text-center hover:bg-white/90 transition-colors ${className}`}
        >
          {button.text}
        </button>
      ) : (
        // Secondary: outline white with transparent bg
        <button
          onClick={handleClick}
          className={`px-10 py-4 ${rounded} text-xl font-semibold text-white border-2 border-white text-center hover:bg-white/10 transition-colors ${className}`}
        >
          {button.text}
        </button>
      )}
      
      <RefillModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
