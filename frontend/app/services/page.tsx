"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { containerStagger, fadeUp } from "@/lib/anim";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/hero/Logo";

type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  features: string[];
  duration: string;
  price: string;
};

const allServices: Service[] = [
  {
    id: "uti",
    title: "Testing & Treatment for UTI",
    description:
      "Quick, confidential testing and effective treatment options to relieve discomfort and prevent recurrence.",
    image: "/uti.png",
    alt: "UTI testing",
    features: ["Same-day results", "Confidential testing", "Expert consultation", "Prescription management"],
    duration: "15-30 minutes",
    price: "Starting at $45"
  },
  {
    id: "strep",
    title: "Testing & Treatment for Strep A",
    description:
      "Fast diagnosis and targeted care to help you recover and prevent the spread of infection.",
    image: "/strep.png",
    alt: "Strep A testing",
    features: ["Rapid testing", "Antibiotic treatment", "Recovery monitoring", "Family protection"],
    duration: "10-20 minutes",
    price: "Starting at $55"
  },
  {
    id: "travel",
    title: "Traveller's Health",
    description:
      "Get travel-ready with essential vaccines, preventive medication, and expert health advice for your destination.",
    image: "/traveler.png",
    alt: "Traveller health",
    features: ["Travel vaccines", "Malaria prevention", "Health certificates", "Destination-specific advice"],
    duration: "30-60 minutes",
    price: "Starting at $75"
  },
  {
    id: "sinus",
    title: "Sinus Infection",
    description:
      "Find relief from sinus pressure and congestion with professional evaluation and treatment tailored to your symptoms.",
    image: "/sinus.png",
    alt: "Sinus infection",
    features: ["Symptom assessment", "Treatment options", "Pain management", "Follow-up care"],
    duration: "20-40 minutes",
    price: "Starting at $50"
  },
  {
    id: "allergies",
    title: "Allergies Treatment",
    description:
      "Personalized allergy relief plans to help you breathe easier and enjoy your day-to-day life.",
    image: "/allergies.png",
    alt: "Allergies treatment",
    features: ["Allergy testing", "Treatment plans", "Seasonal management", "Emergency protocols"],
    duration: "45-90 minutes",
    price: "Starting at $65"
  },
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService && phoneNumber) {
      // Here you would typically send the data to your backend
      console.log("Service Request:", { selectedService, phoneNumber });
      setIsSubmitted(true);
    }
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
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-[#0A438C] mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your service request. We'll contact you at {phoneNumber} within 24 hours.
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
      {/* Hero Section */}
      <section className="relative bg-[#0A438C] text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/services-hero.jpg"
            alt="Healthcare services background"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-white">
              <Logo />
            </Link>
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </motion.header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-medium text-white leading-tight mb-5"
            >
              Our Healthcare Services
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl font-light text-[#D4F4FF] mb-8 leading-relaxed"
            >
              Professional healthcare services tailored to your needs. 
              Select a service below and we'll contact you to schedule an appointment.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
                ✓ Professional Care
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
                ✓ Quick Response
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
                ✓ Confidential Service
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* OUR SERVICES Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-[#E6F3FF] text-[#0A438C] px-8 py-3 rounded-full font-semibold text-lg">
            OUR SERVICES
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {allServices.map((service, index) => (
            <motion.div
              key={service.id}
              variants={fadeUp}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                selectedService === service.id ? 'ring-2 ring-[#0A438C] scale-105' : ''
              }`}
              onClick={() => setSelectedService(service.id)}
            >
              {/* Service Image */}
              <div className="relative h-48 w-full">
                <Image
                  src={service.image}
                  alt={service.alt}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between items-end text-white">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{service.title}</h3>
                      <p className="text-sm opacity-90">{service.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{service.price}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>
                
                {/* Features */}
                <div className="space-y-2 mb-4">
                  {service.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-[#0A438C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button className="w-full bg-[#0A438C] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0A438C]/90 transition-colors">
                  Select This Service
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Service Request Form */}
        {selectedService && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#F7FAFE] to-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto mt-12 border border-[#E6EEF7]"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#0A438C] mb-2">
                Request Service
              </h2>
              <p className="text-gray-600 text-lg">
                {allServices.find(s => s.id === selectedService)?.title}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Service Details */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-[#0A438C] mb-4">Service Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-[#0A438C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{allServices.find(s => s.id === selectedService)?.duration}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-[#0A438C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span>{allServices.find(s => s.id === selectedService)?.price}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-[#0A438C] mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A438C] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Time</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A438C] focus:border-transparent transition-all">
                      <option>Morning (9 AM - 12 PM)</option>
                      <option>Afternoon (12 PM - 5 PM)</option>
                      <option>Evening (5 PM - 8 PM)</option>
                      <option>Any time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-[#0A438C] mb-4">Additional Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements or Notes</label>
                  <textarea
                    placeholder="Any specific requirements or additional information..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A438C] focus:border-transparent transition-all h-24 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <motion.button
                  type="submit"
                  disabled={!phoneNumber}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all ${
                    phoneNumber
                      ? "bg-[#0A438C] text-white hover:bg-[#0A438C]/90 shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Request Service Appointment
                </motion.button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Confidential & Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>24-Hour Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Professional Care</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
