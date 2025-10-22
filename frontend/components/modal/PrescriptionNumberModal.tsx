"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface PrescriptionNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrescriptionNumberModal({
  isOpen,
  onClose,
}: PrescriptionNumberModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-medium text-[#0A438C]">
                How to Find Your Prescription Number
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="text-center">
                <p className="text-gray-600 mb-6 text-lg">
                  Look for the prescription number on your pharmacy label.
                </p>

                {/* Prescription Image */}
                <div className="relative max-w-2xl mx-auto">
                  <Image
                    src="/prescription-number.png"
                    alt="Prescription number example"
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-lg shadow-lg border border-gray-200"
                    priority
                  />

                  {/* Highlight overlay */}
                  <div className="hidden md:block absolute top-[8rem] left-[40%] transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-2">
                      <span className="text-red-600 font-bold text-lg">
                        ← Look for this number
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="bg-[#0A438C] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0A438C]/90 transition-colors"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
