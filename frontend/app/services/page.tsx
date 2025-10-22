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
    id: "smoking-cessation",
    title: "SMOKING CESSATION",
    description:
      "Are you thinking about quitting smoking? Your pharmacist can prescribe you patches/gums/lozenges/inhalers for that matter, and it is 100% free.",
    image: "/smoke.jpg",
    alt: "Smoking cessation",
  },
  {
    id: "lice",
    title: "LICE",
    description:
      "Did you know that your pharmacist can help you getting rid of lice by prescribing an effective treatment? The consultation is confidential and products are covered by Health Canada with a pharmacist prescription.",
    image: "/lice.jpg",
    alt: "Lice treatment",
  },
  {
    id: "travellers-diarrhea",
    title: "TRAVELLER'S DIARRHEA",
    description:
      "If you are going away to the Caribbean or other destinations at risk, we can prescribe antibiotics in case you have traveler's diarrhea so that you keep enjoying your vacation to the fullest! Some fees may apply.",
    image: "/traveler.png",
    alt: "Traveller's diarrhea",
  },
  {
    id: "malaria-mountain-sickness",
    title: "MALARIA AND MOUNTAIN SICKNESS",
    description:
      "If you are planning to go to the South or climbing up a mountain, your pharmacist can prescribe you a medication to prevent malaria (disease transmitted by mosquitoes) and also to prevent mountain sickness.",
    image: "/malaria.jpg",
    alt: "Malaria and mountain sickness",
  },
  {
    id: "pregnancy-nausea-vitamins",
    title: "NAUSEAS AND VITAMINS DURING PREGNANCY",
    description:
      "You are expecting but your first trimester is a bit rough on the digestive system? Your pharmacist can prescribe you medication to help relieve nausea and vomiting due to pregnancy. We can also prescribe you some vitamin supplements to ensure a nice and healthy pregnancy, both for the mother and the baby.",
    image: "/pregnancy-vomit.jpg",
    alt: "Pregnancy nausea and vitamins",
  },
  {
    id: "emergency-contraceptive",
    title: "EMERGENCY CONTRACEPTIVE PILL AND PRESCRIPTION OF A REGULAR CONTRACEPTION",
    description:
      "You need the morning-after pill and you can't get an appointment with your doctor in a short delay? Your pharmacist can prescribe you the pill as well as a regular contraceptive method afterwards. It is 100% confidential and the consultation will be personalized to your needs.",
    image: "/uti.png",
    alt: "Emergency contraceptive",
  },
  {
    id: "shingles",
    title: "Shingles (under certain conditions)",
    description:
      "Are you experiencing a burning, tingling, or itchy sensation with small yellowish blisters on your skin, often on the chest area? It could be shingles. Your pharmacist can assess your condition and prescribe antiviral treatment — ideally within 72 hours of the onset of symptoms. Act quickly to relieve your symptoms and reduce the risk of complications.",
    image: "/herpes.jpg",
    alt: "Shingles treatment",
  },
  {
    id: "sinus-infection",
    title: "Sinus infection (under certain conditions)",
    description:
      "Are you experiencing facial pain or pressure in the forehead area, along with nasal congestion or discharge lasting more than 7 days? You may have a sinus infection. Your pharmacist can assess your symptoms and, if appropriate, prescribe an antibiotic treatment to help you recover faster and feel better.",
    image: "/sinus.jpg",
    alt: "Sinus infection",
  },
  {
    id: "chronic-health-conditions",
    title: "CONSULTATION AND FOLLOW-UP OF CHRONIC HEALTH CONDITIONS",
    description:
      "Are you worried about your sugar levels or is your blood pressure is too high? Do you think you have a side effect to a medication? You can meet with the pharmacist to discuss about your symptoms and treatments. We will give you professional advice and we will help you optimize your actual treatments. You can make an appointment at the pharmacy counter.",
    image: "/diabetes.jpg",
    alt: "Chronic health conditions",
  },
  {
    id: "medication-adjustment",
    title: "ADJUSTING YOUR MEDICATION TO YOUR NEEDS",
    description:
      "At the pharmacy, we offer medication adjustment according to efficacy, tolerance, and compliance. You do not need to take an appointment with your doctor while we are taking care of it at the pharmacy for you. For that matter, we will speak to your physician to get his/her approval beforehand.",
    image: "/side-effect.jpg",
    alt: "Medication adjustment",
  },
  {
    id: "tick-bite",
    title: "Tick Bite",
    description:
      "If you've been bitten by a tick, your pharmacist can assess your situation and, when appropriate, prescribe an antibiotic treatment to help prevent Lyme disease. The assessment is quick and based on where and when the bite occurred. Early action is key!",
    image: "/tick-bite.jpg",
    alt: "Tick bite treatment",
  },
  {
    id: "heartburn-indigestion",
    title: "Heartburn and Indigestion",
    description:
      "Your pharmacist can assess your symptoms and, when appropriate, recommend or prescribe medication to relieve heartburn (acid reflux) and dyspepsia (indigestion). They can help you find the right treatment, offer lifestyle advice, and ensure your medication is safe with your other prescriptions.",
    image: "/heart-burn.jpg",
    alt: "Heartburn and indigestion",
  },
  {
    id: "strep-a-test",
    title: "Throat infection: STREP A TEST",
    description:
      "If you have symptoms of a sudden and severe sore throat, pain when swallowing, fever, and white or yellow spots on the tonsils or back of the throat you can come get tested at the pharmacy. This service has a charge, and if the test is positive, the pharmacist will be able to prescribe an antibiotic and pain killers.",
    image: "/throat-infection.jpg",
    alt: "Strep A test",
  },
  {
    id: "mild-acne",
    title: "MILD ACNE",
    description: "Professional treatment options for mild acne conditions.",
    image: "/acne.jpg",
    alt: "Mild acne treatment",
  },
  {
    id: "seasonal-allergy",
    title: "SEASONAL ALLERGY",
    description: "Relief from seasonal allergy symptoms with professional guidance.",
    image: "/seasonal-allergy.jpg",
    alt: "Seasonal allergy treatment",
  },
  {
    id: "eyes-allergy",
    title: "EYES ALLERGY",
    description: "Specialized treatment for eye allergy symptoms.",
    image: "/eyes-allergy.jpg",
    alt: "Eyes allergy treatment",
  },
  {
    id: "pink-eye-infection",
    title: "PINK EYE (INFECTION)",
    description: "Professional assessment and treatment for pink eye infections.",
    image: "/pink-eye.jpg",
    alt: "Pink eye infection treatment",
  },
  {
    id: "yeast-infection",
    title: "YEAST INFECTION",
    description: "Confidential and effective treatment for yeast infections.",
    image: "/yeast.jpg",
    alt: "Yeast infection treatment",
  },
  {
    id: "athletes-foot",
    title: "ATHLETE'S FOOT (SKIN FUNGUS)",
    description: "Professional treatment for athlete's foot and skin fungal conditions.",
    image: "/athletes-foot.jpg",
    alt: "Athlete's foot treatment",
  },
  {
    id: "multivitamins-kids",
    title: "MULTIVITAMINS/VITAMIN D FOR YOUR KIDS (6 YEARS OLD AND UNDER)",
    description: "Essential vitamins and supplements for children 6 years and under.",
    image: "/kids-multivitamins.jpg",
    alt: "Multivitamins for kids",
  },
  {
    id: "constipation",
    title: "CONSTIPATION",
    description: "Professional guidance and treatment for constipation relief.",
    image: "/constipation.jpg",
    alt: "Constipation treatment",
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
                <div className={`w-full md:w-1/2 space-y-6 ${index % 2 === 1 ? 'md:pl-6' : 'md:pr-6 md:text-right'}`}>
                  <div>
                    <h4 className="text-xl md:text-2xl font-medium text-[#0A438C] mb-4">
                      {service.title}
                    </h4>
                    <p className={`text-gray-600 text-md leading-relaxed ${index % 2 === 0 ? 'md:w-[90%] md:ml-auto' : 'md:w-[80%]'}`}>
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