"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/ToastProvider";
import LoadingSpinner from "../ui/LoadingSpinner";
import FileUpload, { UploadedFile } from "./FileUpload";
import { ClaimDocument } from "./ClaimCard";

interface AddClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: "medications" | "appeals" | "manual-claims" | "diapers-pads";
  onClaimAdded: () => void;
  existingClaim?: ClaimDocument | null;
}

export default function AddClaimModal({
  isOpen,
  onClose,
  category,
  onClaimAdded,
  existingClaim,
}: AddClaimModalProps) {
  const { showSuccess, showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rxNumber: "",
    productName: "",
    prescriberName: "",
    prescriberLicense: "",
    prescriberFax: "",
    prescriberPhone: "",
    dateOfPrescription: "",
    type: "new" as "new" | "renewal" | "prior-authorization",
    claimStatus: "new" as "new" | "case-number-open" | "authorized",
    authorizationNumber: "",
    authorizationStartDate: "",
    authorizationEndDate: "",
    priority: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    if (existingClaim) {
      setFormData({
        rxNumber: existingClaim.rxNumber,
        productName: existingClaim.productName,
        prescriberName: existingClaim.prescriberName,
        prescriberLicense: existingClaim.prescriberLicense,
        prescriberFax: existingClaim.prescriberFax || "",
        prescriberPhone: existingClaim.prescriberPhone || "",
        dateOfPrescription: existingClaim.dateOfPrescription,
        type: existingClaim.type,
        claimStatus: existingClaim.claimStatus,
        authorizationNumber: existingClaim.authorizationNumber || "",
        authorizationStartDate: existingClaim.authorizationStartDate || "",
        authorizationEndDate: existingClaim.authorizationEndDate || "",
        priority: existingClaim.priority,
      });
      setUploadedFiles(existingClaim.documents || []);
      setCurrentStep(1);
    } else {
      setFormData({
        rxNumber: "",
        productName: "",
        prescriberName: "",
        prescriberLicense: "",
        prescriberFax: "",
        prescriberPhone: "",
        dateOfPrescription: "",
        type: "new",
        claimStatus: "new",
        authorizationNumber: "",
        authorizationStartDate: "",
        authorizationEndDate: "",
        priority: false,
      });
      setUploadedFiles([]);
      setCurrentStep(1);
    }
  }, [existingClaim, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const shouldShowAuthorization = () => {
    return (
      formData.claimStatus === "authorized" ||
      formData.type === "prior-authorization"
    );
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (
        !formData.rxNumber ||
        !formData.productName ||
        !formData.prescriberName ||
        !formData.prescriberLicense ||
        !formData.dateOfPrescription ||
        !formData.type ||
        !formData.claimStatus
      ) {
        showError("Please fill in all required fields");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(1)) {
      if (shouldShowAuthorization()) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        category,
        documents: uploadedFiles,
      };

      const url = existingClaim ? "/api/claims" : "/api/claims";
      const method = existingClaim ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          existingClaim ? { ...payload, id: existingClaim.id } : payload
        ),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(
          existingClaim
            ? "Claim updated successfully"
            : "Claim added successfully"
        );
        onClaimAdded();
        onClose();
      } else {
        showError(data.error || "Failed to save claim");
      }
    } catch (error) {
      console.error("Error saving claim:", error);
      showError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getCategoryDisplayName = () => {
    const categoryMap: Record<string, string> = {
      medications: "Medications",
      appeals: "Appeals",
      "manual-claims": "Manual Claims",
      "diapers-pads": "Diapers & Pads",
    };
    return categoryMap[category] || category;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {existingClaim ? "Edit Claim" : "Add Claim"} -{" "}
                {getCategoryDisplayName()}
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mt-6 space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step
                        ? "bg-white text-blue-600"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        currentStep > step ? "bg-white" : "bg-blue-400"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div
            className="p-6 overflow-y-auto"
            style={{ maxHeight: "calc(90vh - 200px)" }}
          >
            {/* Step 1: Claim Details */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rx Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rxNumber"
                    value={formData.rxNumber}
                    onChange={handleInputChange}
                    placeholder="RX-10427"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="Medication or item name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescriber Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="prescriberName"
                    value={formData.prescriberName}
                    onChange={handleInputChange}
                    placeholder="Dr. A. Johnson"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescriber License <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="prescriberLicense"
                    value={formData.prescriberLicense}
                    onChange={handleInputChange}
                    placeholder="CPSO #87921"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescriber Fax (Optional)
                  </label>
                  <input
                    type="text"
                    name="prescriberFax"
                    value={formData.prescriberFax}
                    onChange={handleInputChange}
                    placeholder="+1 (416) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescriber Phone (Optional)
                  </label>
                  <input
                    type="text"
                    name="prescriberPhone"
                    value={formData.prescriberPhone}
                    onChange={handleInputChange}
                    placeholder="+1 (416) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Prescription <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfPrescription"
                    value={formData.dateOfPrescription}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="new">New</option>
                    <option value="renewal">Renewal</option>
                    <option value="prior-authorization">
                      Prior Authorization
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claim Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="claimStatus"
                    value={formData.claimStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="new">New</option>
                    <option value="case-number-open">Case Number Open</option>
                    <option value="authorized">Authorized</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="priority"
                      checked={formData.priority}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Mark as Priority
                    </span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Step 2: Authorization Details */}
            {currentStep === 2 && shouldShowAuthorization() && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authorization Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="authorizationNumber"
                    value={formData.authorizationNumber}
                    onChange={handleInputChange}
                    placeholder="E-number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authorization Start Date
                  </label>
                  <input
                    type="date"
                    name="authorizationStartDate"
                    value={formData.authorizationStartDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authorization End Date
                  </label>
                  <input
                    type="date"
                    name="authorizationEndDate"
                    value={formData.authorizationEndDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Upload Documents */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Scanned Documents
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload PDF or image files related to this claim
                  </p>
                </div>
                <FileUpload
                  uploadedFiles={uploadedFiles}
                  onFilesChange={setUploadedFiles}
                />
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="text-white" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>
                        {existingClaim ? "Update Claim" : "Add Claim"}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
