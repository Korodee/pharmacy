"use client";
import { useState, useEffect } from "react";
import { useToast } from "../ui/ToastProvider";
import LoadingSpinner from "../ui/LoadingSpinner";

interface RefillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RefillModal({ isOpen, onClose }: RefillModalProps) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    phone: "",
    prescriptions: ["", "", "", ""], // Start with 4 empty prescription fields
    deliveryType: "pickup",
    comments: "",
    estimatedTime: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  const addPrescription = () => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: [...prev.prescriptions, "", "", "", ""], // Add 4 more prescription fields
    }));
  };

  const updatePrescription = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((prescription, i) =>
        i === index ? value : prescription
      ),
    }));

    // Clear prescription error when user starts typing
    if (prescriptionError && value.trim() !== "") {
      setPrescriptionError(false);
    }
  };

  // Format phone number for North American format
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // North American format: (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  };

  // Extract only digits from formatted phone number
  const getPhoneDigits = (formattedPhone: string) => {
    return formattedPhone.replace(/\D/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const phoneDigits = getPhoneDigits(formData.phone);
    if (!phoneDigits || phoneDigits.length < 10) {
      return;
    }

    if (!formData.deliveryType) {
      return;
    }

    const validPrescriptions = formData.prescriptions.filter(
      (prescription) => prescription.trim() !== ""
    );
    if (validPrescriptions.length === 0) {
      setPrescriptionError(true);
      return;
    }

    // Clear prescription error if validation passes
    setPrescriptionError(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "refill",
          phone: phoneDigits,
          prescriptions: validPrescriptions,
          deliveryType: formData.deliveryType,
          estimatedTime: formData.estimatedTime,
          comments: formData.comments,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(
          "Refill request submitted successfully! We'll contact you soon."
        );
        // Reset form
        setFormData({
          phone: "",
          prescriptions: ["", "", "", ""],
          deliveryType: "pickup",
          comments: "",
          estimatedTime: "",
        });
        onClose();
      } else {
        showError("Failed to submit request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      showError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80svh] md:max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-medium text-[#0A438C]">
            Request Refill
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Phone Number */}
          <div>
            <h3 className="text-lg font-[300] text-[#0A438C] mb-4">
              Contact Information <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Phone Number Input */}
              <input
                type="tel"
                placeholder="Enter Phone Number *"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setFormData((prev) => ({ ...prev, phone: formatted }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black"
                required
              />
            </div>
          </div>

          {/* Prescription */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-[400] text-[#0A438C]">
                Prescription <span className="text-red-500">*</span>
                {prescriptionError && (
                  <span className="text-red-500 text-sm font-normal ml-2">
                    (at least one required)
                  </span>
                )}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.prescriptions.map((prescription, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={
                    index === 0
                      ? "Rx Number, medication name or all Rx"
                      : index < 4
                      ? "Rx Number or medication name"
                      : "Additional Rx Number or medication name"
                  }
                  value={prescription}
                  onChange={(e) => updatePrescription(index, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black"
                />
              ))}
            </div>

            {/* Add Other Prescriptions Button */}
            <div className="mt-4 flex justify-start">
              <button
                type="button"
                onClick={addPrescription}
                className="bg-[#0A438C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0A438C]/90 flex items-center gap-2"
              >
                <span className="md:hidden">+ Add More Prescriptions</span>
                <span className="hidden md:inline">
                  + Add More Prescriptions
                </span>
              </button>
            </div>
          </div>

          {/* Delivery Type */}
          <div>
            <h3 className="text-lg font-[400] text-[#0A438C] mb-4">
              Delivery Type <span className="text-red-500">*</span>
            </h3>
            <div className="flex gap-3 items-center overflow-x-auto pb-2 md:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-3 min-w-max">
                {[
                  { value: "pickup", label: "Pickup" },
                  { value: "delivery-am", label: "Delivery (AM)" },
                  { value: "delivery-pm", label: "Delivery (PM)" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        deliveryType: option.value,
                        estimatedTime:
                          option.value === "pickup" ? prev.estimatedTime : "",
                      }))
                    }
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      formData.deliveryType === option.value
                        ? "bg-gray-100 text-[#0A438C] border-2 border-[#0A438C] font-semibold"
                        : "bg-white text-gray-500 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 relative min-w-[200px]">
                <input
                  type="text"
                  placeholder={
                    formData.deliveryType === "pickup"
                      ? "Estimate Pick-up Time"
                      : "Select Pick-up to set time"
                  }
                  value={formData.estimatedTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedTime: e.target.value,
                    }))
                  }
                  onFocus={() =>
                    formData.deliveryType === "pickup" &&
                    setShowDatePicker(true)
                  }
                  disabled={formData.deliveryType !== "pickup"}
                  className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A438C] focus:border-transparent ${
                    formData.deliveryType === "pickup"
                      ? "cursor-pointer"
                      : "cursor-not-allowed bg-gray-100 text-gray-400"
                  } ${formData.estimatedTime ? "text-black" : "text-gray-500"}`}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() =>
                    formData.deliveryType === "pickup" &&
                    setShowDatePicker(!showDatePicker)
                  }
                  disabled={formData.deliveryType !== "pickup"}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    formData.deliveryType === "pickup"
                      ? "text-gray-400 hover:text-gray-600"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 ${
                      formData.deliveryType === "pickup"
                        ? "text-gray-400"
                        : "text-gray-300"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>

                {/* Date Picker Popup */}
                {showDatePicker && (
                  <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setShowDatePicker(false)}
                  >
                    <div
                      className="bg-white border border-gray-300 rounded-xl shadow-lg w-full max-w-md mx-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 w-full max-w-full">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-medium text-gray-700">
                            Select Date & Time
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowDatePicker(false)}
                            className="text-gray-400 hover:text-gray-600 text-xl"
                          >
                            ×
                          </button>
                        </div>

                        {/* Date Input */}
                        <div className="mb-4 w-full">
                          <label className="block text-xs text-gray-600 mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black"
                            onChange={(e) => {
                              const date = e.target.value;
                              const time =
                                formData.estimatedTime.split(" ")[1] || "";
                              setFormData((prev) => ({
                                ...prev,
                                estimatedTime: `${date} ${time}`.trim(),
                              }));
                            }}
                          />
                        </div>

                        {/* Time Input */}
                        <div className="mb-4 w-full">
                          <label className="block text-xs text-gray-600 mb-2">
                            Time
                          </label>
                          <input
                            type="time"
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black"
                            onChange={(e) => {
                              const time = e.target.value;
                              const date =
                                formData.estimatedTime.split(" ")[0] || "";
                              setFormData((prev) => ({
                                ...prev,
                                estimatedTime: `${date} ${time}`.trim(),
                              }));
                            }}
                          />
                        </div>

                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => setShowDatePicker(false)}
                            className="flex-1 px-4 py-3 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDatePicker(false)}
                            className="flex-1 px-4 py-3 text-sm bg-[#0A438C] text-white rounded-lg hover:bg-[#0A438C]/90 transition-colors font-medium"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Other */}
          <div>
            <h3 className="text-lg font-[400] text-[#0A438C] mb-4">Other</h3>
            <textarea
              placeholder="Add Comments"
              value={formData.comments}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comments: e.target.value }))
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent resize-none text-black"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg text-md font-medium transition-colors flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0A438C] text-white hover:bg-[#0A438C]/90"
              }`}
            >
              {isSubmitting && (
                <LoadingSpinner size="sm" className="text-white" />
              )}
              {isSubmitting ? "Sending Request..." : "Send Request"}
            </button>
            <p className="text-center mt-4 text-sm">
              <a href="#" className="text-[#0A438C] text-sm hover:underline">
                Click here to know how to find the prescription number.
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
