"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { containerStagger, fadeUp } from "@/lib/anim";
import Image from "next/image";
import Link from "next/link";
import FAQSection from "@/components/faq/FAQSection";
import CTASection from "@/components/cta/CTASection";
import Footer from "@/components/footer/Footer";
import HeroSection from "@/components/hero/HeroSection";
import StatementSection from "@/components/statement/StatementSection";
import ConsultationModal from "@/components/modal/ConsultationModal";

type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
};

const allServices: Service[] = [
  {
    id: "uti",
    title: "Testing & Treatment for UTI",
    description:
      "Quick, confidential testing and effective treatment options to relieve discomfort and prevent recurrence.",
    image: "/uti.png",
    alt: "UTI testing",
  },
  {
    id: "strep",
    title: "Testing & Treatment for Strep A",
    description:
      "Fast diagnosis and targeted care to help you recover and prevent the spread of infection.",
    image: "/strep.png",
    alt: "Strep A testing",
  },
  {
    id: "travel",
    title: "Traveller's Health",
    description:
      "Get travel-ready with essential vaccines, preventive medication, and expert health advice for your destination.",
    image: "/traveler.png",
    alt: "Traveller health",
  },
  {
    id: "sinus",
    title: "Sinus Infection",
    description:
      "Find relief from sinus pressure and congestion with professional evaluation and treatment tailored to your symptoms.",
    image: "/sinus.png",
    alt: "Sinus infection",
  },
  {
    id: "allergies",
    title: "Allergies Treatment",
    description:
      "Personalized allergy relief plans to help you breathe easier and enjoy your day-to-day life.",
    image: "/allergies.png",
    alt: "Allergies treatment",
  },
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState<boolean>(false);
  const [preSelectedService, setPreSelectedService] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService && phoneNumber) {
      // Here you would typically send the data to your backend
      console.log("Service Request:", { selectedService, phoneNumber });
      setIsSubmitted(true);
    }
  };

  const handleRequestService = (serviceId: string) => {
    setPreSelectedService(serviceId);
    setIsConsultationModalOpen(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-[#0A438C] mb-2">
            Request Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your service request. We'll contact you at{" "}
            {phoneNumber} within 24 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#0A438C] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0A438C]/90 transition-colors"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Same component, custom content and background */}
      <HeroSection
        customBackgroundImage="/services-hero.png"
        customContent={{
          primaryHeading: "Caring for You, One Service at a Time",
          secondaryHeading: "",
          description:
            "Your health matters to us. From everyday care to expert consultations, we've got you covered.",
          buttons: [
            {
              text: "Book a Consultation",
              variant: "primary",
              href: "modal",
            },
            {
              text: "Request A Refill",
              variant: "secondary",
              href: "modal",
            },
          ],
        }}
      />

      {/* Statement Section - Same component, custom text */}
      <StatementSection customText="We believe good health starts with the right support. Our pharmacists provide personalized guidance, answer your questions, and help you make the most of every treatment." />

      {/* Services Section */}
      <section id="services" className="w-full bg-white">
        <motion.div
          className="max-w-6xl mx-auto px-16 md:px-10 py-20"
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h3
            variants={fadeUp}
            className="text-center text-3xl md:text-4xl font-semibold text-[#0A438C] mb-14"
          >
            Comprehensive Care For Your Health
          </motion.h3>

          {/* Services with Alternating Layout */}
          <div className="space-y-16">
            {allServices.map((service, index) => (
              <motion.div
                key={service.id}
                variants={fadeUp}
                className={`flex flex-col ${
                  index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
                } gap-8 items-center`}
              >
                {/* Service Image */}
                <div className="w-full md:w-1/2">
                  <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={service.image}
                      alt={service.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Service Content */}
                <div className={`w-full md:w-1/2 space-y-6 ${index % 2 === 1 ? 'md:pl-14' : 'md:pr-14 md:text-right'}`}>
                  <div>
                    <h4 className="text-xl md:text-2xl font-medium text-[#0A438C] mb-4">
                      {service.title}
                    </h4>
                    <p className={`text-gray-600 text-lg leading-relaxed mb-6 ${index % 2 === 0 ? 'md:w-[80%] md:ml-auto' : 'md:w-[80%]'}`}>
                      {service.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleRequestService(service.id)}
                    className="bg-[#0A438C] text-white px-6 py-2 rounded-xl font-semibold text-lg hover:bg-[#0A438C]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Request Service
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />

      {/* Consultation Modal */}
      <ConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={() => setIsConsultationModalOpen(false)}
        preSelectedService={preSelectedService}
      />
    </div>
  );
}