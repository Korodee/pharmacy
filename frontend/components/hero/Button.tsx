"use client";
import { HeroButton } from "@/lib/data/heroData";
import { useState } from "react";
import RefillModal from "../modal/RefillModal";
import ConsultationModal from "../modal/ConsultationModal";

interface ButtonProps {
  button: HeroButton;
  className?: string;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isConsultationModalOpen: boolean;
  setIsConsultationModalOpen: (open: boolean) => void;
}

export default function Button({ button, className = "", isModalOpen, setIsModalOpen, isConsultationModalOpen, setIsConsultationModalOpen }: ButtonProps) {
  const rounded = "rounded-[20px]";

  const handleClick = () => {
    if (button.text === "Request A Refill") {
      setIsModalOpen(true);
    } else if (button.text === "Book a Consultation" || button.text === "Book a Consultation") {
      setIsConsultationModalOpen(true);
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
      <ConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={() => setIsConsultationModalOpen(false)} 
      />
    </>
  );
}
