"use client";
import { useState, useEffect } from "react";

interface RefillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RefillModal({ isOpen, onClose }: RefillModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    prescriptions: [""],
    deliveryType: "pickup",
    comments: "",
    estimatedTime: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const addPrescription = () => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: [...prev.prescriptions, ""],
    }));
  };

  const updatePrescription = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((prescription, i) =>
        i === index ? value : prescription
      ),
    }));
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
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
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
        <form className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-[300] text-[#0A438C] mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Enter Your Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black"
              />
              <input
                type="tel"
                placeholder="Enter Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black"
              />
            </div>
          </div>

          {/* Prescription */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-[400] text-[#0A438C]">
                Prescription
              </h3>
                  <button
                    type="button"
                    onClick={addPrescription}
                    className="bg-[#0A438C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0A438C]/90 flex items-center gap-2"
                  >
                    <span className="md:hidden">+ Add</span>
                    <span className="hidden md:inline">+ Add Other Prescriptions</span>
                  </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {formData.prescriptions.map((prescription, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={
                      index === 0
                        ? "Rx Number, medication name or all Rx"
                        : "Rx Number or medication name"
                    }
                    value={prescription}
                    onChange={(e) => updatePrescription(index, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black"
                  />
                ))}
              </div>
              <div className="space-y-3">
                {formData.prescriptions.map((prescription, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={
                      index === 0
                        ? "Rx Number, medication name or all Rx"
                        : "Rx Number or medication name"
                    }
                    value={prescription}
                    onChange={(e) => updatePrescription(index, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black"
                  />
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {" "}
              <div className="space-y-3">
                {formData.prescriptions.map((prescription, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={
                      index === 0
                        ? "Rx Number, medication name or all Rx"
                        : "Rx Number or medication name"
                    }
                    value={prescription}
                    onChange={(e) => updatePrescription(index, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black"
                  />
                ))}
              </div>
              <div className="space-y-3">
                {formData.prescriptions.map((prescription, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={
                      index === 0
                        ? "Rx Number, medication name or all Rx"
                        : "Rx Number or medication name"
                    }
                    value={prescription}
                    onChange={(e) => updatePrescription(index, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Type */}
          <div>
            <h3 className="text-lg font-[400] text-[#0A438C] mb-4">
              Delivery Type
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
                  placeholder="Estimate Delivery Time"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  onFocus={() => setShowDatePicker(true)}
                  className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A438C] focus:border-transparent cursor-pointer ${
                    formData.estimatedTime ? 'text-black' : 'text-gray-500'
                  }`}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <svg
                    className="w-4 h-4 text-gray-400"
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
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-full max-w-full">
                    <div className="p-4 w-full max-w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-medium text-gray-700">Select Date & Time</h4>
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
                        <label className="block text-xs text-gray-600 mb-2">Date</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black"
                          onChange={(e) => {
                            const date = e.target.value;
                            const time = formData.estimatedTime.split(' ')[1] || '';
                            setFormData(prev => ({ 
                              ...prev, 
                              estimatedTime: `${date} ${time}`.trim() 
                            }));
                          }}
                        />
                      </div>
                      
                      {/* Time Input */}
                      <div className="mb-4 w-full">
                        <label className="block text-xs text-gray-600 mb-2">Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black"
                          onChange={(e) => {
                            const time = e.target.value;
                            const date = formData.estimatedTime.split(' ')[0] || '';
                            setFormData(prev => ({ 
                              ...prev, 
                              estimatedTime: `${date} ${time}`.trim() 
                            }));
                          }}
                        />
                      </div>
                      
                      {/* Quick Time Options */}
                      <div className="mb-4 w-full">
                        <label className="block text-xs text-gray-600 mb-2">Quick Select</label>
                        <div className="grid grid-cols-2 gap-2 w-full">
                          {['09:00', '12:00', '15:00', '18:00'].map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                const date = formData.estimatedTime.split(' ')[0] || new Date().toISOString().split('T')[0];
                                setFormData(prev => ({ 
                                  ...prev, 
                                  estimatedTime: `${date} ${time}`.trim() 
                                }));
                              }}
                              className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
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
              className="w-full bg-[#0A438C] text-white py-4 rounded-lg text-lg font-semibold hover:bg-[#0A438C]/90 transition-colors"
            >
              Send Request
            </button>
            <p className="text-center mt-4">
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
