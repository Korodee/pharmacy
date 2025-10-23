"use client";
import { useState } from "react";
import HeroSection from "@/components/hero/HeroSection";
import StatementSection from "@/components/statement/StatementSection";
import HowItWorksSection from "@/components/how-it-works/HowItWorksSection";
import ServicesSection from "@/components/services/ServicesSection";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import FAQSection from "@/components/faq/FAQSection";
import CTASection from "@/components/cta/CTASection";
import Footer from "@/components/footer/Footer";
import RefillModal from "@/components/modal/RefillModal";

export default function Home() {
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);

  return (
    <main className="min-h-screen">
      <HeroSection />
      <HowItWorksSection onRefillClick={() => setIsRefillModalOpen(true)} />
      <ServicesSection />
      {/* <TestimonialsSection /> */}
      <FAQSection />
      {/* <CTASection /> */}
      <StatementSection />
      <Footer />
      
      {/* Refill Modal */}
      <RefillModal 
        isOpen={isRefillModalOpen} 
        onClose={() => setIsRefillModalOpen(false)} 
      />
    </main>
  );
}
