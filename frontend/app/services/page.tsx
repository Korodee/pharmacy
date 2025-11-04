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

// Main services with detailed descriptions and images
const mainServices: Service[] = [
  {
    id: "smoking-cessation",
    title: "Smoking Cessation",
    description:
      "Are you thinking about quitting smoking? Your pharmacist can prescribe you patches/gums/lozenges/inhalers for that matter, and it is 100% free.",
    image: "/smoking-cessation-new.png",
    alt: "Smoking cessation",
  },
  {
    id: "lice",
    title: "Lice",
    description:
      "Did you know that your pharmacist can help you getting rid of lice by prescribing an effective treatment? The consultation is confidential and products are covered by Health Canada with a pharmacist prescription.",
    image: "/Hair-lice-new.png",
    alt: "Lice treatment",
  },
  {
    id: "travellers-diarrhea",
    title: "Traveller's Diarrhea",
    description:
      "If you are going away to the Caribbean or other destinations at risk, we can prescribe antibiotics in case you have traveler's diarrhea so that you keep enjoying your vacation to the fullest! Some fees may apply.",
    image: "/Traveller’s-Diarrhea-new.png",
    alt: "Traveller's diarrhea",
  },
  {
    id: "malaria-mountain-sickness",
    title: "Malaria and Mountain Sickness",
    description:
      "If you are planning to go to the South or climbing up a mountain, your pharmacist can prescribe you a medication to prevent malaria (disease transmitted by mosquitoes) and also to prevent mountain sickness.",
    image: "/Mountain-sickness-and-Malaria-new.png",
    alt: "Malaria and mountain sickness",
  },
  {
    id: "pregnancy-nausea-vitamins",
    title: "Nauseas and Vitamins During Pregnancy",
    description:
      "You are expecting but your first trimester is a bit rough on the digestive system? Your pharmacist can prescribe you medication to help relieve nausea and vomiting due to pregnancy. We can also prescribe you some vitamin supplements to ensure a nice and healthy pregnancy, both for the mother and the baby.",
    image: "/pregnant-woman-new.png",
    alt: "Pregnancy nausea and vitamins",
  },
  {
    id: "emergency-contraceptive",
    title:
      "Emergency Contraceptive Pill and Prescription of a Regular Contraception",
    description:
      "You need the morning-after pill and you can't get an appointment with your doctor in a short delay? Your pharmacist can prescribe you the pill as well as a regular contraceptive method afterwards. It is 100% confidential and the consultation will be personalized to your needs.",
    image: "/Emergency-contraceptive-pill-and-regular contraception-new.png",
    alt: "Emergency contraceptive",
  },
  {
    id: "shingles",
    title: "Shingles (Under Certain Conditions)",
    description:
      "Are you experiencing a burning, tingling, or itchy sensation with small yellowish blisters on your skin, often on the chest area? It could be shingles. Your pharmacist can assess your condition and prescribe antiviral treatment — ideally within 72 hours of the onset of symptoms. Act quickly to relieve your symptoms and reduce the risk of complications.",
    image: "/Shingles-new.png",
    alt: "Shingles treatment",
  },
  {
    id: "sinus-infection",
    title: "Sinus Infection (Under Certain Conditions)",
    description:
      "Are you experiencing facial pain or pressure in the forehead area, along with nasal congestion or discharge lasting more than 7 days? You may have a sinus infection. Your pharmacist can assess your symptoms and, if appropriate, prescribe an antibiotic treatment to help you recover faster and feel better.",
    image: "/sinus-infection-new.png",
    alt: "Sinus infection",
  },
  {
    id: "chronic-health-conditions",
    title: "Consultation and Follow-up of Chronic Health Conditions",
    description:
      "Are you worried about your sugar levels or is your blood pressure is too high? Do you think you have a side effect to a medication? You can meet with the pharmacist to discuss about your symptoms and treatments. We will give you professional advice and we will help you optimize your actual treatments. You can make an appointment at the pharmacy counter.",
    image: "/diabetes.jpg",
    alt: "Chronic health conditions",
  },
  {
    id: "medication-adjustment",
    title: "Adjusting Your Medication to Your Needs",
    description:
      "At the pharmacy, we offer medication adjustment according to efficacy, tolerance, and compliance. You do not need to take an appointment with your doctor while we are taking care of it at the pharmacy for you. For that matter, we will speak to your physician to get his/her approval beforehand.",
    image: "/ADJUSTING-YOUR-MEDICATION-TO-YOUR-NEEDS-new.png",
    alt: "Medication adjustment",
  },
  {
    id: "tick-bite",
    title: "Tick Bite",
    description:
      "If you've been bitten by a tick, your pharmacist can assess your situation and, when appropriate, prescribe an antibiotic treatment to help prevent Lyme disease. The assessment is quick and based on where and when the bite occurred. Early action is key!",
    image: "/Tick-bite-new.png",
    alt: "Tick bite treatment",
  },
  {
    id: "heartburn-indigestion",
    title: "Heartburn and Indigestion",
    description:
      "Your pharmacist can assess your symptoms and, when appropriate, recommend or prescribe medication to relieve heartburn (acid reflux) and dyspepsia (indigestion). They can help you find the right treatment, offer lifestyle advice, and ensure your medication is safe with your other prescriptions.",
    image: "/Heartburn-new.png",
    alt: "Heartburn and indigestion",
  },
  {
    id: "strep-a-test",
    title: "Throat Infection: Strep A Test",
    description:
      "If you have symptoms of a sudden and severe sore throat, pain when swallowing, fever, and white or yellow spots on the tonsils or back of the throat you can come get tested at the pharmacy. This service has a charge, and if the test is positive, the pharmacist will be able to prescribe an antibiotic and pain killers.",
    image: "/throat-infection.jpg",
    alt: "Strep A test",
  },
  {
    id: "uti-treatment",
    title: "Testing & Treatment for UTI",
    description:
      "If you're experiencing symptoms like frequent urination, burning sensation, or lower abdominal pain, you may have a urinary tract infection. Your pharmacist can assess your symptoms and, when appropriate, prescribe antibiotic treatment to help you recover quickly and comfortably.",
    image: "/testing-&-treatment-for-UTI-new.png",
    alt: "UTI testing and treatment",
  },
  {
    id: "allergies-treatment",
    title: "Allergies Treatment",
    description:
      "Whether you're dealing with seasonal allergies, food allergies, or environmental allergens, our pharmacists can help assess your symptoms and recommend appropriate treatments. We can prescribe antihistamines, nasal sprays, and other medications to help you manage your allergies effectively and improve your quality of life.",
    image: "/allergies.png",
    alt: "Allergies treatment",
  },
];

// Minor conditions grouped together
const minorConditions = [
  { id: "mild-acne", title: "Mild Acne" },
  { id: "seasonal-allergy", title: "Seasonal Allergy" },
  { id: "eyes-allergy", title: "Eyes Allergy" },
  { id: "pink-eye-infection", title: "Pink Eye (Infection)" },
  { id: "yeast-infection", title: "Yeast Infection" },
  { id: "athletes-foot", title: "Athlete's Foot (Skin Fungus)" },
  {
    id: "multivitamins-kids",
    title: "Multivitamins/Vitamin D for Your Kids (6 Years Old and Under)",
  },
  { id: "constipation", title: "Constipation" },
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] =
    useState<boolean>(false);
  const [preSelectedService, setPreSelectedService] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService && phoneNumber) {
      // Here you would typically send the data to your backend
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

      {/* Services Section */}
      <section id="services" className="w-full bg-white">
        <motion.div
          className="max-w-6xl mx-auto px-4 md:px-10 py-20"
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h3
            variants={fadeUp}
            className="text-center text-3xl md:text-4xl font-semibold text-[#0A438C] mb-14"
          >
            Discover our healthcare services
          </motion.h3>

          {/* Main Services with Alternating Layout */}
          <div className="space-y-16">
            {mainServices.map((service, index) => (
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
                <div
                  className={`w-full md:w-1/2 space-y-6 ${
                    index % 2 === 1 ? "md:pl-6" : "md:pr-6 md:text-right"
                  }`}
                >
                  <div>
                    <h4 className="text-xl md:text-2xl font-medium text-[#0A438C] mb-4">
                      {service.title}
                    </h4>
                    <p
                      className={`text-gray-600 text-md leading-relaxed ${
                        index % 2 === 0 ? "md:w-[90%] md:ml-auto" : "md:w-[80%]"
                      }`}
                    >
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

      {/* Minor Conditions Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center"
          >
            <motion.h3
              variants={fadeUp}
              className="text-3xl md:text-4xl font-semibold text-[#0A438C] mb-4"
            >
              Minor Conditions
            </motion.h3>
            <motion.p
              variants={fadeUp}
              className="text-gray-600 text-lg mb-1 max-w-3xl mx-auto"
            >
              We also provide professional treatment and guidance for these
              common minor conditions:
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-[#0A438C] text-md mb-12 max-w-3xl mx-auto font-medium"
            >
              Click on any condition below to request a consultation
            </motion.p>

            {/* Minor Conditions Grid */}
            <motion.div
              variants={containerStagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {minorConditions.map((condition, index) => (
                <motion.button
                  key={index}
                  variants={fadeUp}
                  onClick={() => handleRequestService(condition.id)}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:bg-gray-50 text-center w-full flex items-center justify-center"
                >
                  <h4 className="text-[#0A438C] font-semibold text-lg">
                    {condition.title}
                  </h4>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      {/* <CTASection /> */}
      {/* Statement Section - Same component, custom text */}
      <StatementSection customText="We believe good health starts with the right support. Our pharmacists provide personalized guidance, answer your questions, and help you make the most of every treatment." />
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
