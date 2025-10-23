"use client";
import { useState, useEffect } from "react";
import { useToast } from "../ui/ToastProvider";
import LoadingSpinner from "../ui/LoadingSpinner";
import PrescriptionNumberModal from "./PrescriptionNumberModal";

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
    preferredDate: "",
    preferredTime: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isPrescriptionNumberModalOpen, setIsPrescriptionNumberModalOpen] =
    useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll without changing position
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
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

  // Business hours logic (same as ConsultationModal)
  const getAvailableTimes = (selectedDate?: string) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Business hours: Monday-Friday 9 AM to 8 PM, Saturday 9:30 AM to 2 PM
    const isWeekend = now.getDay() === 0 || now.getDay() === 6; // Sunday = 0, Saturday = 6
    const isSaturday = now.getDay() === 6;

    let businessStart = isSaturday ? 9.5 : 9; // 9:30 AM on Saturday, 9 AM on weekdays
    let businessEnd = isSaturday ? 14 : 20; // 2 PM on Saturday, 8 PM on weekdays

    // If it's Sunday, start from next Monday at 9 AM
    if (now.getDay() === 0) {
      const nextMonday = new Date(now);
      const daysUntilMonday = (1 - now.getDay() + 7) % 7;
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(9, 0, 0, 0);
      return generateTimeSlots(nextMonday);
    }

    // If it's after business hours or before business start, start from next business day
    if (
      currentHour >= businessEnd ||
      currentHour < businessStart ||
      (isSaturday && currentHour === 9 && currentMinute < 30)
    ) {
      const nextBusinessDay = new Date(now);
      if (isSaturday && currentHour >= 14) {
        // If it's Saturday after 2 PM, go to Monday
        const daysUntilMonday = (1 - now.getDay() + 7) % 7;
        nextBusinessDay.setDate(now.getDate() + daysUntilMonday);
        nextBusinessDay.setHours(9, 0, 0, 0);
      } else {
        // Otherwise, go to next day
        nextBusinessDay.setDate(now.getDate() + 1);
        if (nextBusinessDay.getDay() === 6) {
          // If next day is Saturday, start at 9:30 AM
          nextBusinessDay.setHours(9, 30, 0, 0);
        } else {
          // Otherwise start at 9 AM
          nextBusinessDay.setHours(9, 0, 0, 0);
        }
      }
      return generateTimeSlots(nextBusinessDay);
    }

    // If it's during business hours, start 4 hours from now
    const fourHoursLater = new Date(now);
    fourHoursLater.setHours(fourHoursLater.getHours() + 4);

    // If 4 hours later is after business hours, start next business day
    if (fourHoursLater.getHours() >= businessEnd) {
      const nextBusinessDay = new Date(now);
      if (isSaturday) {
        // If it's Saturday, go to Monday
        const daysUntilMonday = (1 - now.getDay() + 7) % 7;
        nextBusinessDay.setDate(now.getDate() + daysUntilMonday);
        nextBusinessDay.setHours(9, 0, 0, 0);
      } else {
        // Otherwise, go to next day
        nextBusinessDay.setDate(now.getDate() + 1);
        if (nextBusinessDay.getDay() === 6) {
          // If next day is Saturday, start at 9:30 AM
          nextBusinessDay.setHours(9, 30, 0, 0);
        } else {
          // Otherwise start at 9 AM
          nextBusinessDay.setHours(9, 0, 0, 0);
        }
      }
      return generateTimeSlots(nextBusinessDay);
    }

    return generateTimeSlots(fourHoursLater);
  };

  // Generate time slots starting from a given time
  const generateTimeSlots = (startTime: Date) => {
    const slots = [];
    const dayOfWeek = startTime.getDay();
    const isSaturday = dayOfWeek === 6;
    const businessEnd = isSaturday ? 14 : 20; // 2 PM on Saturday, 8 PM on weekdays

    let currentTime = new Date(startTime);

    // For Saturday, if it's exactly 9:30 AM, start there; otherwise round up to next hour
    if (
      isSaturday &&
      currentTime.getHours() === 9 &&
      currentTime.getMinutes() === 30
    ) {
      // Start at 9:30 AM on Saturday
    } else if (currentTime.getMinutes() > 0) {
      // Round up to the next hour for other times
      currentTime.setHours(currentTime.getHours() + 1);
      currentTime.setMinutes(0);
    }

    // Generate slots until business end
    while (currentTime.getHours() < businessEnd) {
      const timeString = currentTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      slots.push({
        value: timeString,
        label: timeString,
        date: currentTime.toISOString().split("T")[0],
      });

      currentTime.setHours(currentTime.getHours() + 1);
    }

    return slots;
  };

  // Get available dates (next 30 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Include weekdays and Saturday, skip Sunday
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split("T")[0],
          label: date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          isSaturday: date.getDay() === 6,
        });
      }
    }

    return dates;
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isPast = currentDate < today;
      const isSunday = currentDate.getDay() === 0;
      const isAvailable = !isPast && !isSunday && isCurrentMonth;

      days.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isToday,
        isPast,
        isSunday,
        isAvailable,
        dayNumber: currentDate.getDate(),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // Navigate calendar months
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
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
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
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
          preferredDate: "",
          preferredTime: "",
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80svh] md:max-h-[90vh] overflow-y-auto scrollbar-hide">
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
            <div>
              <h3 className="text-lg font-[400] text-[#0A438C] mb-4">
                Delivery Type <span className="text-red-500">*</span>
              </h3>
              <div className="flex gap-3 items-center overflow-x-auto pb-2 md:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-3 min-w-max">
                  {[
                    { value: "pickup", label: "Pickup" },
                    { value: "delivery-am", label: "Delivery (Noon)" },
                    { value: "delivery-pm", label: "Delivery (Evening)" },
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
                          preferredDate:
                            option.value === "pickup" ? prev.preferredDate : "",
                          preferredTime:
                            option.value === "pickup" ? prev.preferredTime : "",
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
                    } ${
                      formData.estimatedTime ? "text-black" : "text-gray-500"
                    }`}
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

                  {/* Calendar Modal */}
                  {showDatePicker && (
                    <div
                      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
                      onClick={() => setShowDatePicker(false)}
                    >
                      <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Header */}
                        <div className="p-4 text-black">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                              Select Date
                            </h3>

                            <button
                              onClick={() => setShowDatePicker(false)}
                              className="text-white/80 hover:text-white text-xl"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <hr className="border-gray-200" />
                        {/* Calendar */}
                        <div className="p-4">
                          {/* Month Navigation */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              onClick={() => navigateMonth("prev")}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {currentMonth.toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                              })}
                            </h4>
                            <button
                              onClick={() => navigateMonth("next")}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1 mb-4">
                            {[
                              "Sun",
                              "Mon",
                              "Tue",
                              "Wed",
                              "Thu",
                              "Fri",
                              "Sat",
                            ].map((day) => (
                              <div
                                key={day}
                                className="p-2 text-center text-sm font-medium text-gray-500"
                              >
                                {day}
                              </div>
                            ))}
                            {generateCalendarDays().map((day, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  if (day.isAvailable) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      preferredDate: day.date
                                        .toISOString()
                                        .split("T")[0],
                                    }));
                                    setShowDatePicker(false);
                                    setShowTimePicker(true);
                                  }
                                }}
                                disabled={!day.isAvailable}
                                className={`p-2 text-sm rounded-lg transition-colors ${
                                  day.isAvailable
                                    ? "hover:bg-blue-100 text-gray-900"
                                    : "text-gray-300 cursor-not-allowed"
                                } ${
                                  day.isToday
                                    ? "bg-blue-100 text-blue-600 font-semibold"
                                    : ""
                                } ${
                                  !day.isCurrentMonth ? "text-gray-300" : ""
                                }`}
                              >
                                {day.dayNumber}
                              </button>
                            ))}
                          </div>

                          {/* Business Hours Info */}
                          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                            <p className="font-medium mb-1">Business Hours:</p>
                            <p>Monday-Friday: 9:00 AM - 8:00 PM</p>
                            <p>Saturday: 9:30 AM - 2:00 PM</p>
                            <p>Sunday: Closed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Time Picker Modal */}
                  {showTimePicker && (
                    <div
                      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
                      onClick={() => setShowTimePicker(false)}
                    >
                      <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Header */}
                        <div className="p-4 text-black">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                              Select Time
                            </h3>
                            <button
                              onClick={() => setShowTimePicker(false)}
                              className="text-white/80 hover:text-white text-xl"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <hr className="border-gray-200" />
                        {/* Time Slots */}
                        <div className="p-4 max-h-96 overflow-y-auto">
                          <div className="space-y-2">
                            {getAvailableTimes(formData.preferredDate).map(
                              (slot, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      preferredTime: slot.value,
                                      estimatedTime:
                                        `${prev.preferredDate} ${slot.value}`.trim(),
                                    }));
                                    setShowTimePicker(false);
                                  }}
                                  className="w-full p-3 text-left hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                                >
                                  <span className="text-gray-900 font-medium">
                                    {slot.label}
                                  </span>
                                </button>
                              )
                            )}
                          </div>

                          {/* Business Hours Info */}
                          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mt-4">
                            <p className="font-medium mb-1">Business Hours:</p>
                            <p>Monday-Friday: 9:00 AM - 8:00 PM</p>
                            <p>Saturday: 9:30 AM - 2:00 PM</p>
                            <p>Sunday: Closed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm mt-3 text-gray-500">
              We request a minimum of 4 hours to fill an order, we are doing our
              best to serve you!
            </p>
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
              <button
                type="button"
                onClick={() => setIsPrescriptionNumberModalOpen(true)}
                className="text-[#0A438C] text-sm hover:underline"
              >
                Click here to know how to find the prescription number.
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Prescription Number Modal */}
      <PrescriptionNumberModal
        isOpen={isPrescriptionNumberModalOpen}
        onClose={() => setIsPrescriptionNumberModalOpen(false)}
      />
    </div>
  );
}
