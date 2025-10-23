"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/ToastProvider";
import LoadingSpinner from "../ui/LoadingSpinner";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: string;
}

export default function ConsultationModal({
  isOpen,
  onClose,
  preSelectedService,
}: ConsultationModalProps) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    phone: "",
    service: "",
    preferredDate: "",
    preferredTime: "",
    additionalNote: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Pre-fill service when preSelectedService is provided
  useEffect(() => {
    if (preSelectedService && isOpen) {
      setFormData((prev) => ({
        ...prev,
        service: preSelectedService,
      }));
    }
  }, [preSelectedService, isOpen]);

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

  // Get phone digits only
  const getPhoneDigits = (phone: string) => {
    return phone.replace(/\D/g, "");
  };

  // Business hours logic
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const phoneDigits = getPhoneDigits(formData.phone);
    if (!phoneDigits || phoneDigits.length < 10) {
      showError("Please enter a valid phone number with at least 10 digits.");
      return;
    }

    if (!formData.service) {
      showError("Please select a service.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "consultation",
          phone: phoneDigits,
          service: formData.service,
          preferredDateTime: `${formData.preferredDate} ${formData.preferredTime}`,
          additionalNote: formData.additionalNote,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(
          "Consultation request submitted successfully! We'll contact you soon."
        );
        // Reset form
        setFormData({
          phone: "",
          service: "",
          preferredDate: "",
          preferredTime: "",
          additionalNote: "",
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80svh] md:max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-medium text-[#0A438C]">
            Book A Consultation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-[400] text-[#0A438C] mb-4">
              Contact Information <span className="text-red-500">*</span>
            </h3>
            {/* Phone Input */}
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setFormData((prev) => ({ ...prev, phone: formatted }));
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black placeholder:text-gray-400"
              required
            />
          </div>

          {/* Select Service */}
          <div>
            <h3 className="text-lg font-[400] text-[#0A438C] mb-4">
              Select Service <span className="text-red-500">*</span>
            </h3>
            <div className="relative">
              <select
                value={formData.service}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, service: e.target.value }))
                }
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black appearance-none bg-white cursor-pointer"
                required
              >
                <option value="" className="text-gray-500">
                  Choose a service
                </option>
                <option value="smoking-cessation">SMOKING CESSATION</option>
                <option value="lice">LICE</option>
                <option value="travellers-diarrhea">
                  TRAVELLER'S DIARRHEA
                </option>
                <option value="malaria-mountain-sickness">
                  MALARIA AND MOUNTAIN SICKNESS
                </option>
                <option value="pregnancy-nausea-vitamins">
                  NAUSEAS AND VITAMINS DURING PREGNANCY
                </option>
                <option value="emergency-contraceptive">
                  EMERGENCY CONTRACEPTIVE PILL AND PRESCRIPTION OF A REGULAR
                  CONTRACEPTION
                </option>
                <option value="shingles">
                  Shingles (under certain conditions)
                </option>
                <option value="sinus-infection">
                  Sinus infection (under certain conditions)
                </option>
                <option value="chronic-health-conditions">
                  CONSULTATION AND FOLLOW-UP OF CHRONIC HEALTH CONDITIONS
                </option>
                <option value="medication-adjustment">
                  ADJUSTING YOUR MEDICATION TO YOUR NEEDS
                </option>
                <option value="tick-bite">Tick Bite</option>
                <option value="heartburn-indigestion">
                  Heartburn and Indigestion
                </option>
                <option value="strep-a-test">
                  Throat infection: STREP A TEST
                </option>
                <option value="mild-acne">MILD ACNE</option>
                <option value="seasonal-allergy">SEASONAL ALLERGY</option>
                <option value="eyes-allergy">EYES ALLERGY</option>
                <option value="pink-eye-infection">PINK EYE (INFECTION)</option>
                <option value="yeast-infection">YEAST INFECTION</option>
                <option value="athletes-foot">
                  ATHLETE'S FOOT (SKIN FUNGUS)
                </option>
                <option value="multivitamins-kids">
                  MULTIVITAMINS/VITAMIN D FOR YOUR KIDS (6 YEARS OLD AND UNDER)
                </option>
                <option value="constipation">CONSTIPATION</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Preferred Date and Time */}
          <div>
            <h3 className="text-lg font-[400] text-[#0A438C] mb-4">
              Preferred Date and Time
            </h3>
            <div className="flex gap-3">
              {/* Date Picker */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Select Date"
                  value={
                    formData.preferredDate
                      ? new Date(formData.preferredDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : ""
                  }
                  onFocus={() => setShowDatePicker(true)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent cursor-pointer text-black placeholder:text-gray-400"
                  readOnly
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* Time Picker */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Select Time"
                  value={formData.preferredTime || ""}
                  onFocus={() => setShowTimePicker(true)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent cursor-pointer text-black placeholder:text-gray-400"
                  readOnly
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              We will do our best to consult with you at the selected time!
            </p>
          </div>

          {/* Additional Note */}
          <div>
            <h3 className="text-lg font-[400] text-[#0A438C] mb-4">
              Additional Note
            </h3>
            <textarea
              placeholder="Add Comments"
              value={formData.additionalNote}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  additionalNote: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent text-black placeholder:text-gray-400 h-24 resize-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0A438C] text-white hover:bg-[#0A438C]/90"
            }`}
          >
            {isSubmitting && (
              <LoadingSpinner size="sm" className="text-white" />
            )}
            {isSubmitting ? "Sending Request..." : "Send Request"}
          </motion.button>
        </form>
      </motion.div>

      {/* Date Picker Modal */}
      <AnimatePresence>
        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowDatePicker(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-300 rounded-xl shadow-lg w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Select Date
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
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
                  <h5 className="text-lg font-semibold text-gray-900">
                    {currentMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h5>
                  <button
                    type="button"
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
                  {/* Day headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-2 text-center text-sm font-medium text-gray-500"
                      >
                        {day}
                      </div>
                    )
                  )}

                  {/* Calendar days */}
                  {generateCalendarDays().map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (day.isAvailable) {
                          const dateString = day.date
                            .toISOString()
                            .split("T")[0];
                          setFormData((prev) => ({
                            ...prev,
                            preferredDate: dateString,
                          }));
                          setShowDatePicker(false);
                        }
                      }}
                      disabled={!day.isAvailable}
                      className={`p-2 text-sm rounded-lg transition-colors ${
                        day.isAvailable
                          ? formData.preferredDate ===
                            day.date.toISOString().split("T")[0]
                            ? "bg-[#0A438C] text-white"
                            : "hover:bg-gray-100 text-gray-700"
                          : "text-gray-300 cursor-not-allowed"
                      } ${day.isToday ? "ring-2 ring-blue-300" : ""}`}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Picker Modal */}
      <AnimatePresence>
        {showTimePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowTimePicker(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-300 rounded-xl shadow-lg w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Select Time
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowTimePicker(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {getAvailableTimes(formData.preferredDate).map(
                    (time, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            preferredTime: time.value,
                          }));
                          setShowTimePicker(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                          formData.preferredTime === time.value
                            ? "bg-[#0A438C] text-white"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {time.label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
