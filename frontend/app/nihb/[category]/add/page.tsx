"use client";

import { useState, useEffect } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import FileUpload, { UploadedFile } from "@/components/claims/FileUpload";
import { ClaimDocument } from "@/components/claims/ClaimCard";
import PageHeader from "@/components/layout/PageHeader";

export default function AddClaimPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = params?.category as string;
  const pathname = usePathname();
  const baseNIHBPath =
    pathname && pathname.includes("/admin/nihb") ? "/admin/nihb" : "/nihb";
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    rxNumber: "",
    productName: "",
    prescriberName: "",
    prescriberLicense: "",
    prescriberFax: "",
    dinItem: "",
    din: "",
    itemNumber: "",
    dateOfPrescription: "",
    type: "new" as "new" | "renewal",
    claimStatus: "new" as
      | "new"
      | "case-number-open"
      | "authorized"
      | "denied"
      | "letter-sent-to-doctor"
      | "letters-received"
      | "letters-sent-to-nihb"
      | "form-filled"
      | "form-sent-to-doctor"
      | "sent-to-nihb"
      | "sent"
      | "payment-received",
    patientSignedLetter: false,
    caseNumber: "",
    authorizationNumber: "",
    authorizationStartDate: "",
    authorizationEndDate: "",
    priority: false,
    note: "",
    // Manual claims specific fields
    manualClaimType: "" as "" | "baby" | "old",
    parentNameOnFile: false,
    parentBandNumberUpdated: false,
    dateOfRefill: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const claimId = searchParams?.get("id");
  const isEditMode = Boolean(claimId);

  // Prefill when editing
  useEffect(() => {
    const loadClaim = async () => {
      if (!claimId) return;
      try {
        // Try fetching by id directly
        const res = await fetch(`/api/claims?id=${claimId}`);
        const data = await res.json();
        if (data?.success && data?.claim) {
          const c = data.claim;
          setFormData({
            rxNumber: c.rxNumber || "",
            productName: c.productName || "",
            prescriberName: c.prescriberName || "",
            prescriberLicense: c.prescriberLicense || "",
            prescriberFax: c.prescriberFax || "",
            dinItem: c.dinItem || "",
            din: c.din || "",
            itemNumber: c.itemNumber || "",
            dateOfPrescription: c.dateOfPrescription || c.dateOfRefill || "",
            type: c.type || "new",
            claimStatus: c.claimStatus || "new",
            patientSignedLetter: Boolean(c.patientSignedLetter),
            caseNumber: c.caseNumber || "",
            authorizationNumber: c.authorizationNumber || "",
            authorizationStartDate: c.authorizationStartDate || "",
            authorizationEndDate: c.authorizationEndDate || "",
            priority: Boolean(c.priority),
            note: "",
            manualClaimType: c.manualClaimType || "",
            parentNameOnFile: Boolean(c.parentNameOnFile),
            parentBandNumberUpdated: Boolean(c.parentBandNumberUpdated),
            dateOfRefill: c.dateOfRefill || "",
          });
          setUploadedFiles(c.documents || []);
        } else {
          // Fallback: fetch by category then find
          const resAll = await fetch(`/api/claims?category=${category}`);
          const all = await resAll.json();
          const c = all?.claims?.find((x: any) => x.id === claimId);
          if (c) {
            setFormData({
              rxNumber: c.rxNumber || "",
              productName: c.productName || "",
              prescriberName: c.prescriberName || "",
              prescriberLicense: c.prescriberLicense || "",
              prescriberFax: c.prescriberFax || "",
              dinItem: c.dinItem || "",
              din: c.din || "",
              itemNumber: c.itemNumber || "",
              dateOfPrescription: c.dateOfPrescription || c.dateOfRefill || "",
              type: c.type || "new",
              claimStatus: c.claimStatus || "new",
              patientSignedLetter: Boolean(c.patientSignedLetter),
              caseNumber: c.caseNumber || "",
              authorizationNumber: c.authorizationNumber || "",
              authorizationStartDate: c.authorizationStartDate || "",
              authorizationEndDate: c.authorizationEndDate || "",
              priority: Boolean(c.priority),
              note: "",
              manualClaimType: c.manualClaimType || "",
              parentNameOnFile: Boolean(c.parentNameOnFile),
              parentBandNumberUpdated: Boolean(c.parentBandNumberUpdated),
              dateOfRefill: c.dateOfRefill || "",
            });
            setUploadedFiles(c.documents || []);
          }
        }
      } catch (e) {
        console.error("Failed to load claim", e);
      }
    };
    loadClaim();
  }, [claimId, category]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    // For caseNumber, only allow digits
    if (name === "caseNumber") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Format phone number for North American format
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  };

  const handlePhoneChange = (name: string, value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData((prev) => ({ ...prev, [name]: formatted }));
  };

  // Calendar functions
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // For prescription date and refill date, allow past dates. For authorization dates, restrict past dates.
    const allowPastDates =
      currentDateField === "dateOfPrescription" ||
      currentDateField === "dateOfRefill";

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isPast = currentDate < todayStart;
      const isSunday = currentDate.getDay() === 0;
      // Allow past dates for prescription date, but restrict for authorization dates
      const isAvailable = (allowPastDates || !isPast) && !isSunday;

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

  const openDatePicker = (fieldName: string) => {
    setCurrentDateField(fieldName);
    setShowDatePicker(true);
  };

  const selectDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const dayNum = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${dayNum}`;

    if (currentDateField === "dateOfRefill") {
      setFormData((prev) => ({
        ...prev,
        dateOfRefill: dateString,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [currentDateField]: dateString,
      }));
    }
    setShowDatePicker(false);
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const normalizeForStorage = (value: string) => {
    if (!value) return "";
    // Accept both MM/DD/YYYY and YYYY-MM-DD and always return YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [mm, dd, yyyy] = value.split("/");
      return `${yyyy}-${mm}-${dd}`;
    }
    return value; // assume already YYYY-MM-DD
  };

  const shouldShowAuthorization = () => {
    return formData.claimStatus === "authorized";
  };

  const shouldShowCaseNumber = () => {
    return (
      formData.claimStatus === "case-number-open" && category !== "diapers-pads"
    );
  };

  const validateForm = (): boolean => {
    if (category === "manual-claims") {
      if (
        !formData.rxNumber ||
        !formData.productName ||
        !formData.dinItem ||
        !formData.manualClaimType ||
        !formData.dateOfRefill
      ) {
        showError("Please fill in all required fields");
        return false;
      }
      // If baby is selected, check the checklist items
      if (formData.manualClaimType === "baby") {
        if (!formData.parentNameOnFile || !formData.parentBandNumberUpdated) {
          showError(
            "Please confirm both checklist items for Baby manual claim"
          );
          return false;
        }
      }
      return true;
    }
    if (
      !formData.rxNumber ||
      !formData.productName ||
      !formData.prescriberName ||
      !formData.prescriberLicense ||
      !formData.dateOfPrescription ||
      !formData.claimStatus
    ) {
      showError("Please fill in all required fields");
      return false;
    }
    // Type is only required for non-appeals and non-diapers-pads categories
    if (
      category !== "appeals" &&
      category !== "diapers-pads" &&
      !formData.type
    ) {
      showError("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        // For manual claims, always set status to "new"
        claimStatus:
          category === "manual-claims" ? "new" : formData.claimStatus,
        // Ensure date fields are saved in canonical YYYY-MM-DD
        dateOfPrescription:
          category === "manual-claims"
            ? ""
            : normalizeForStorage(formData.dateOfPrescription),
        dateOfRefill:
          category === "manual-claims"
            ? normalizeForStorage(formData.dateOfRefill)
            : "",
        authorizationStartDate: normalizeForStorage(
          formData.authorizationStartDate
        ),
        authorizationEndDate: normalizeForStorage(
          formData.authorizationEndDate
        ),
        category,
        documents: uploadedFiles,
        ...(claimId ? { id: claimId } : {}),
      };

      const response = await fetch(
        claimId ? `/api/claims?id=${claimId}` : "/api/claims",
        {
          method: claimId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success) {
        // If there's a note, add it to the claim
        if (formData.note.trim()) {
          await fetch("/api/claims/notes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              claimId: data.claim?.id || claimId,
              text: formData.note,
              staffUsername: "Admin User", // TODO: Get from auth context
            }),
          });
        }

        showSuccess(
          claimId ? "Claim updated successfully" : "Claim successfully added"
        );
        setShowSuccessModal(true);
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

  const getCategoryDisplayName = () => {
    const categoryMap: Record<string, string> = {
      medications: "MEDICATIONS",
      appeals: "APPEALS",
      "manual-claims": "MANUAL CLAIMS",
      "diapers-pads": "DIAPERS & PADS",
    };
    return categoryMap[category] || "CLAIMS";
  };

  return (
    <>
      {/* Header */}
      <PageHeader title="" description="" />

      {/* Main Content */}
      <div className="flex-1 bg-white overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center text-[#392F49] hover:text-[#392F49] transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1"
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
            <span className="text-sm font-medium text-[#392F49]">Back</span>
          </button>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className=""
          >
            {/* Form Fields */}
            {category === "manual-claims" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                    RX Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rxNumber"
                    value={formData.rxNumber}
                    onChange={handleInputChange}
                    placeholder="e.g RX-10427"
                    className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                    Name of Medication <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="e.g Amoxicillin"
                    className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                    DIN/#Item <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dinItem"
                    value={formData.dinItem}
                    onChange={handleInputChange}
                    placeholder="DIN-XXXXXXX"
                    className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>

                {/* Manual Claim Type Selection */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                    Manual Claim Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-6 h-[44px]">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="manualClaimType"
                        value="baby"
                        checked={formData.manualClaimType === "baby"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#0A438C] border-gray-300 focus:ring-[#0A438C] cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Baby Manual Claim
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="manualClaimType"
                        value="old"
                        checked={formData.manualClaimType === "old"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#0A438C] border-gray-300 focus:ring-[#0A438C] cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Old Claim
                      </span>
                    </label>
                  </div>
                </div>

                {/* Baby Checklist - Only show if Baby is selected */}
                {formData.manualClaimType === "baby" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#6E6C70] mb-3">
                      Patient Reminder Checklist{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="parentNameOnFile"
                          checked={formData.parentNameOnFile}
                          onChange={handleCheckboxChange}
                          className="w-4 h-4 text-[#0A438C] border-gray-300 rounded focus:ring-[#0A438C] cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Parent's name on file
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="parentBandNumberUpdated"
                          checked={formData.parentBandNumberUpdated}
                          onChange={handleCheckboxChange}
                          className="w-4 h-4 text-[#0A438C] border-gray-300 rounded focus:ring-[#0A438C] cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Parent's band number updated
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Date of Refill */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                    Date of Refill <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="dateOfRefill"
                      value={formatDateForDisplay(formData.dateOfRefill)}
                      onChange={handleInputChange}
                      onClick={() => openDatePicker("dateOfRefill")}
                      placeholder="mm/dd/yyyy"
                      className="w-full px-4 text-[14px] py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900 cursor-pointer"
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => openDatePicker("dateOfRefill")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                    RX Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rxNumber"
                    value={formData.rxNumber}
                    onChange={handleInputChange}
                    placeholder="e.g RX-10427"
                    className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                    {category === "appeals"
                      ? "Medication Name"
                      : "Product Name"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder={
                      category === "appeals"
                        ? "e.g Ozempic 0.5mg Pen"
                        : "e.g Amoxicillin"
                    }
                    className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>

                {category === "appeals" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                        DIN/#Item
                      </label>
                      <input
                        type="text"
                        name="dinItem"
                        value={formData.dinItem}
                        onChange={handleInputChange}
                        placeholder="DIN-XXXXXXX"
                        className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                        Prescriber Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="prescriberName"
                        value={formData.prescriberName}
                        onChange={handleInputChange}
                        placeholder="eg. Dr. A. Johnson"
                        className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                        Prescriber License{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="prescriberLicense"
                        value={formData.prescriberLicense}
                        onChange={handleInputChange}
                        placeholder="eg. CPSO #87921"
                        className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                        Prescriber Fax
                      </label>
                      <input
                        type="tel"
                        name="prescriberFax"
                        value={formData.prescriberFax}
                        onChange={(e) =>
                          handlePhoneChange(e.target.name, e.target.value)
                        }
                        placeholder="(XXX) XXX-XXXX"
                        className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                        Prescriber Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="prescriberName"
                        value={formData.prescriberName}
                        onChange={handleInputChange}
                        placeholder="eg. Dr. A. Johnson"
                        className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                        Prescriber License{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="prescriberLicense"
                        value={formData.prescriberLicense}
                        onChange={handleInputChange}
                        placeholder="eg. CPSO #87921"
                        className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                        Prescriber Fax
                      </label>
                      <input
                        type="tel"
                        name="prescriberFax"
                        value={formData.prescriberFax}
                        onChange={(e) =>
                          handlePhoneChange(e.target.name, e.target.value)
                        }
                        placeholder="(XXX) XXX-XXXX"
                        className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                      />
                    </div>

                    {category === "diapers-pads" ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                            DIN
                          </label>
                          <input
                            type="text"
                            name="din"
                            value={formData.din}
                            onChange={handleInputChange}
                            placeholder="DIN-XXXXXXX"
                            className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                            Item#
                          </label>
                          <input
                            type="text"
                            name="itemNumber"
                            value={formData.itemNumber}
                            onChange={handleInputChange}
                            placeholder="Item Number"
                            className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                          DIN/#Item
                        </label>
                        <input
                          type="text"
                          name="dinItem"
                          value={formData.dinItem}
                          onChange={handleInputChange}
                          placeholder="DIN-XXXXXXX"
                          className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                        />
                      </div>
                    )}
                  </>
                )}

              <div className={category === "appeals" && formData.claimStatus !== "authorized" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                  Date of Prescription <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="dateOfPrescription"
                    value={formatDateForDisplay(formData.dateOfPrescription)}
                    onChange={handleInputChange}
                    onClick={() => openDatePicker("dateOfPrescription")}
                    placeholder="mm/dd/yyyy"
                    className="w-full px-4 text-[14px] py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900 cursor-pointer"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => openDatePicker("dateOfPrescription")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

                {category !== "appeals" && (
                  <div>
                    <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 text-[14px] py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none appearance-none bg-white text-gray-900"
                      >
                        <option value="new">New</option>
                        <option value="renewal">Renewal</option>
                      </select>
                      <svg
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
                )}

                {shouldShowCaseNumber() && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                      Case Number
                    </label>
                    <input
                      type="text"
                      name="caseNumber"
                      value={formData.caseNumber}
                      onChange={handleInputChange}
                      placeholder="12345678"
                      maxLength={8}
                      className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                    />
                  </div>
                )}

                {shouldShowAuthorization() && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                        Authorization Start Date
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="authorizationStartDate"
                          value={formatDateForDisplay(
                            formData.authorizationStartDate
                          )}
                          onChange={handleInputChange}
                          onClick={() =>
                            openDatePicker("authorizationStartDate")
                          }
                          placeholder="mm/dd/yyyy"
                          className="w-full px-4 text-[14px] py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900 cursor-pointer"
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={() =>
                            openDatePicker("authorizationStartDate")
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {category === "appeals" ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                            Authorization Number
                          </label>
                          <input
                            type="text"
                            name="authorizationNumber"
                            value={formData.authorizationNumber}
                            onChange={handleInputChange}
                            placeholder="E1234567"
                            className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                            Authorization End Date
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="authorizationEndDate"
                              value={formatDateForDisplay(
                                formData.authorizationEndDate
                              )}
                              onChange={handleInputChange}
                              onClick={() =>
                                openDatePicker("authorizationEndDate")
                              }
                              placeholder="mm/dd/yyyy"
                              className="w-full px-4 text-[14px] py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900 cursor-pointer"
                              readOnly
                            />
                            <button
                              type="button"
                              onClick={() =>
                                openDatePicker("authorizationEndDate")
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Patient Signed Letter Checkbox for Appeals */}
                        <div className="md:col-span-2">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              name="patientSignedLetter"
                              checked={formData.patientSignedLetter}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  patientSignedLetter: e.target.checked,
                                }))
                              }
                              className="w-5 h-5 text-[#0A438C] border-gray-300 rounded focus:ring-2 focus:ring-[#0A438C] focus:ring-offset-2 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-[#6E6C70]">
                              Patient Signed Letter
                            </span>
                          </label>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                          Authorization End Date
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="authorizationEndDate"
                            value={formatDateForDisplay(
                              formData.authorizationEndDate
                            )}
                            onChange={handleInputChange}
                            onClick={() =>
                              openDatePicker("authorizationEndDate")
                            }
                            placeholder="mm/dd/yyyy"
                            className="w-full px-4 text-[14px] py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900 cursor-pointer"
                            readOnly
                          />
                          <button
                            type="button"
                            onClick={() =>
                              openDatePicker("authorizationEndDate")
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {shouldShowAuthorization() &&
              category !== "appeals" &&
              category !== "manual-claims" && (
                <div className="mb-8">
                  <label className="block text-sm font-medium text-[#6E6C70] mb-2">
                    Authorization Number
                  </label>
                  <input
                    type="text"
                    name="authorizationNumber"
                    value={formData.authorizationNumber}
                    onChange={handleInputChange}
                    placeholder="E1234567"
                    className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>
              )}

            {/* PDF Templates for Appeals */}
            {category === "appeals" && (
              <div className="mb-8">
                <h3 className="block text-sm font-medium text-[#6E6C70] mb-4">
                  Download Letter Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="/appeals-patient-letter.pdf"
                    download="Patient_Letter_Template.pdf"
                    className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Patient Letter Template
                        </p>
                        <p className="text-xs text-gray-500">
                          Standard letter for the patient
                        </p>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </a>

                  <a
                    href="/appeals-doctor-letter.pdf"
                    download="Doctor_Letter_Template.pdf"
                    className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Doctor Letter Template
                        </p>
                        <p className="text-xs text-gray-500">
                          Letter for the doctor
                        </p>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="mb-8">
              <h3 className="block text-sm font-medium text-[#6E6C70] mb-2">
                Notes
              </h3>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Add any additional notes about this claim..."
                rows={4}
                className="w-full px-4 text-[14px] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none resize-none placeholder:text-gray-400 text-gray-900"
              />
            </div>

            {/* Upload Section */}
            <div className="mb-8">
              <h3 className="block text-sm font-medium text-[#6E6C70] mb-2">
                Upload Scanned Documents
              </h3>
              <FileUpload
                uploadedFiles={uploadedFiles}
                onFilesChange={setUploadedFiles}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => router.back()}
                className="px-6 text-[14px] py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#0A438C] text-white rounded-lg hover:bg-[#003366] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEditMode ? "Save Changes" : "Add Claim"}</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

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
                <h3 className="text-lg font-semibold">Select Date</h3>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
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
                  type="button"
                  onClick={() => navigateMonth("prev")}
                  className="p-3 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
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
                  type="button"
                  onClick={() => navigateMonth("next")}
                  className="p-3 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
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
                {generateCalendarDays().map((day, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (day.isAvailable) {
                        selectDate(day.date);
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
                    } ${!day.isCurrentMonth ? "text-gray-300" : ""}`}
                  >
                    {day.dayNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-[#E6F7ED] flex items-center justify-center">
              <svg
                className="w-10 h-10 text-[#0A438C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {isEditMode ? "Claim Updated" : "Claim Successfully Added"}
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              {isEditMode
                ? "Your changes have been saved."
                : "The claim has been added to the dashboard. You can update its details or view documents anytime."}
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push(`${baseNIHBPath}/${category}`);
              }}
              className="w-full bg-[#0A438C] hover:bg-[#0A438C]/90 text-white rounded-lg py-2.5 text-sm font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
}
