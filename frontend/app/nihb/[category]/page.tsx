"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useToast } from "../../../components/ui/ToastProvider";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import DashboardSummary from "../../../components/claims/DashboardSummary";
import ClaimFilters from "../../../components/claims/ClaimFilters";
import ClaimsTable from "../../../components/claims/ClaimsTable";
import Pagination from "../../../components/claims/Pagination";
import ClaimDetailsModal from "../../../components/claims/ClaimDetailsModal";
import PageHeader from "../../../components/layout/PageHeader";
import { ClaimDocument } from "../../../components/claims/ClaimCard";

export default function NIHBCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params?.category as string;
  const pathname = usePathname();
  const baseNIHBPath =
    pathname && pathname.includes("/admin/nihb") ? "/admin/nihb" : "/nihb";
  const { showSuccess, showError, showInfo } = useToast();
  const [claims, setClaims] = useState<ClaimDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<ClaimDocument | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<
    | null
    | "authorized"
    | "case-number-open"
  >(null);
  const [pendingClaimId, setPendingClaimId] = useState<string | null>(null);
  const [authNumber, setAuthNumber] = useState("");
  const [authStartDate, setAuthStartDate] = useState("");
  const [authEndDate, setAuthEndDate] = useState("");
  const [authIndefinite, setAuthIndefinite] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");
  const [showFormDownloadModal, setShowFormDownloadModal] = useState(false);
  const [pendingFormDownloadClaimId, setPendingFormDownloadClaimId] = useState<string | null>(null);

  // Date picker state for modal (reuse UX)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<
    "authorizationStartDate" | "authorizationEndDate" | ""
  >("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatDateForDisplay = (yyyyMmDd: string) => {
    if (!yyyyMmDd) return "";
    const [y, m, d] = yyyyMmDd.split("-");
    if (!y || !m || !d) return yyyyMmDd;
    return `${m}/${d}/${y}`;
  };

  const openDatePicker = (
    fieldName: "authorizationStartDate" | "authorizationEndDate"
  ) => {
    setCurrentDateField(fieldName);
    setShowDatePicker(true);
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

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Allow selecting past dates as requested
    const allowPastDates = true;

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isPast: boolean;
      isSunday: boolean;
      isAvailable: boolean;
      dayNumber: number;
    }> = [];
    const cursor = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = cursor.getMonth() === month;
      const isToday = cursor.toDateString() === today.toDateString();
      const isPast = cursor < todayStart;
      const isSunday = cursor.getDay() === 0;
      const isAvailable = (allowPastDates || !isPast) && !isSunday;
      days.push({
        date: new Date(cursor),
        isCurrentMonth,
        isToday,
        isPast,
        isSunday,
        isAvailable,
        dayNumber: cursor.getDate(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  };

  const selectDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const iso = `${y}-${m}-${d}`;
    if (currentDateField === "authorizationStartDate") {
      setAuthStartDate(iso);
    } else if (currentDateField === "authorizationEndDate") {
      setAuthEndDate(iso);
    }
    setShowDatePicker(false);
  };

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [prescriberFilter, setPrescriberFilter] = useState("");
  const [dateMode, setDateMode] = useState<'none' | 'prescription' | 'expiry'>('none');
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [productFilter, setProductFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/claims?category=${category}`);
      const data = await response.json();

      if (data.success) {
        setClaims(data.claims);
      } else {
        showError("Failed to fetch claims");
      }
    } catch (err) {
      console.error("Error fetching claims:", err);
      showError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [category, showError]);

  useEffect(() => {
    if (category) {
      fetchClaims();
    }
  }, [category, fetchClaims]);

  const handleClaimClick = (claim: ClaimDocument) => {
    setSelectedClaim(claim);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (claim: ClaimDocument) => {
    router.push(`${baseNIHBPath}/${category}/add?id=${claim.id}` as any);
  };

  const handleDelete = async (
    claim: ClaimDocument,
    deletionNote?: string,
    deletedBy?: string
  ) => {
    try {
      const response = await fetch(`/api/claims?id=${claim.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deletionNote: deletionNote || "",
          deletedBy: deletedBy || "",
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("Claim archived successfully");
        fetchClaims();
      } else {
        showError(data.error || "Failed to delete claim");
      }
    } catch (error) {
      console.error("Error deleting claim:", error);
      showError("Network error. Please try again.");
    }
  };

  const handleStatusChange = async (
    claimId: string,
    newStatus:
      | "new"
      | "case-number-open"
      | "authorized"
      | "denied"
      | "letter-sent-to-doctor"
      | "letters-received"
      | "letters-sent-to-nihb"
      | "form-filled"
      | "form-sent-to-doctor"
      | "received-form-from-doctor"
      | "sent-to-nihb"
      | "sent"
      | "payment-received"
  ) => {
    // If switching to statuses that require extra info, open modal instead
    if (newStatus === "authorized" || newStatus === "case-number-open") {
      setPendingClaimId(claimId);
      setPendingStatus(newStatus);
      setAuthNumber("");
      setAuthStartDate("");
      setAuthEndDate("");
      setAuthIndefinite(false);
      setCaseNumber("");
      setShowMetaModal(true);
      return;
    }

    // Find the claim to get its category for contextual messages
    const claim = claims.find(c => c.id === claimId);

    try {
      const response = await fetch(`/api/claims?id=${claimId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimStatus: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Show contextual notifications based on status and category
        let statusMessage = "Status updated successfully.";
        let infoMessage = "";

        if (claim?.category === "diapers-pads") {
          switch (newStatus) {
            case "new":
              statusMessage = "Claim created. You can now download the Doctor's Form.";
              infoMessage = "Go to the claim edit page to download the Doctor's Form with presentation page.";
              break;
            case "form-filled":
              statusMessage = "Status updated. Doctor's Form is available for download.";
              infoMessage = "You can download the Doctor's Form with presentation page from the edit page.";
              break;
            case "form-sent-to-doctor":
              statusMessage = "Status updated. Waiting for doctor's response.";
              infoMessage = "Once you receive the filled form from the doctor, mark it as 'Received Form from Doctor'.";
              break;
            case "received-form-from-doctor":
              // Show modal for form download
              setPendingFormDownloadClaimId(claimId);
              setShowFormDownloadModal(true);
              statusMessage = "Great! You can now download the Medical Supplies Form.";
              infoMessage = "";
              break;
            case "sent-to-nihb":
              statusMessage = "Status updated. Forms have been sent to NIHB.";
              infoMessage = "Waiting for authorization response from NIHB.";
              break;
            case "denied":
              statusMessage = "Claim status updated to denied.";
              break;
            default:
              statusMessage = "Status updated successfully.";
          }
        } else if (claim?.category === "appeals") {
          switch (newStatus) {
            case "letter-sent-to-doctor":
              statusMessage = "Letter sent to doctor. Waiting for response.";
              infoMessage = "Once you receive the letters, mark it as 'Letters Received'.";
              break;
            case "letters-received":
              statusMessage = "Letters received. Ready to send to NIHB.";
              infoMessage = "You can now mark it as 'Letters Sent to NIHB' when submitted.";
              break;
            case "letters-sent-to-nihb":
              statusMessage = "Letters sent to NIHB. Waiting for response.";
              infoMessage = "Waiting for authorization or denial response from NIHB.";
              break;
            case "denied":
              statusMessage = "Appeal status updated to denied.";
              break;
            default:
              statusMessage = "Status updated successfully.";
          }
        } else if (claim?.category === "manual-claims") {
          switch (newStatus) {
            case "sent":
              statusMessage = "Manual claim sent. Waiting for payment.";
              infoMessage = "Once payment is received, mark it as 'Payment Received'.";
              break;
            case "payment-received":
              statusMessage = "Payment received for manual claim!";
              break;
            default:
              statusMessage = "Status updated successfully.";
          }
        }

        showSuccess(statusMessage, 8000);
        if (infoMessage) {
          setTimeout(() => {
            showInfo(infoMessage, 10000);
          }, 500);
        }
        fetchClaims();
      } else {
        showError(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showError("Network error. Please try again.");
    }
  };

  const handlePatientSignedLetterToggle = async (
    claimId: string,
    currentValue: boolean
  ) => {
    try {
      const response = await fetch(`/api/claims?id=${claimId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientSignedLetter: !currentValue }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(
          `Patient Signed Letter ${
            !currentValue ? "marked" : "unmarked"
          } successfully.`
        );
        fetchClaims();
      } else {
        showError(
          data.error || "Failed to update patient signed letter status"
        );
      }
    } catch (error) {
      console.error("Error updating patient signed letter:", error);
      showError("Network error. Please try again.");
    }
  };

  // Statistics
  const stats = {
    total: claims.length,
    new: claims.filter((c) => c.claimStatus === "new").length,
    caseNumberOpen: claims.filter((c) => c.claimStatus === "case-number-open")
      .length,
    completed: claims.filter((c) => c.claimStatus === "authorized").length,
    denied: claims.filter((c) => c.claimStatus === "denied").length,
  };

  // Filter claims
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.rxNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.prescriberName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || claim.claimStatus === statusFilter;
    const matchesType = typeFilter === "all" || claim.type === typeFilter;
    const matchesPrescriber =
      !prescriberFilter ||
      claim.prescriberName
        .toLowerCase()
        .includes(prescriberFilter.toLowerCase());
    const matchesProduct =
      !productFilter ||
      claim.productName.toLowerCase().includes(productFilter.toLowerCase());

    const matchesDate = () => {
      if (dateMode === 'none') return true;
      const start = dateStart && /^\d{4}-\d{2}-\d{2}$/.test(dateStart) ? new Date(dateStart) : null;
      const end = dateEnd && /^\d{4}-\d{2}-\d{2}$/.test(dateEnd) ? new Date(dateEnd) : null;
      const valueStr = dateMode === 'prescription' ? claim.dateOfPrescription : claim.authorizationEndDate;
      if (!valueStr) return false;
      const value = new Date(valueStr);
      if (isNaN(value.getTime())) return false;
      if (start && value < start) return false;
      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23,59,59,999);
        if (value > endOfDay) return false;
      }
      return true;
    };

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesPrescriber &&
      matchesProduct &&
      matchesDate()
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredClaims.length / rowsPerPage);
  const paginatedClaims = filteredClaims.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-brand-blue mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Dashboard
          </h3>
          <p className="text-gray-600">Fetching claims...</p>
        </div>
      </div>
    );
  }

  const getCategoryDisplayName = () => {
    const categoryMap: Record<string, string> = {
      medications: "All Medication",
      appeals: "All Appeals",
      "manual-claims": "All Manual Claims",
      "diapers-pads": "All Diapers & Pads",
    };
    return categoryMap[category] || "All Claims";
  };

  return (
    <>
      {/* Header */}
      <PageHeader
        title={getCategoryDisplayName()}
        description="Manage insurance claims and authorizations"
      />

      {/* Dashboard Content */}
      <div className="flex-1 bg-white overflow-auto pl-4 pr-6 py-6">
        {/* Add Claim Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() =>
              router.push(`${baseNIHBPath}/${category}/add` as any)
            }
            className="flex items-center space-x-2 bg-[#0A438C] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition-colors shadow-md"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="font-medium text-sm">Add Claim</span>
          </button>
        </div>

        {/* Summary Cards */}
        <DashboardSummary
          total={stats.total}
          new={stats.new}
          caseNumberOpen={stats.caseNumberOpen}
          completed={stats.completed}
          denied={stats.denied}
          category={category}
          onAddClaim={() => {}}
          onStatusClick={setStatusFilter}
        />
        {/* Claims Section */}
        <div className="mt-6">
          {/* Filters */}
          <ClaimFilters
            title={getCategoryDisplayName()}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            dateMode={dateMode}
            onDateModeChange={setDateMode}
            dateStart={dateStart}
            onDateStartChange={setDateStart}
            dateEnd={dateEnd}
            onDateEndChange={setDateEnd}
            category={category}
          />

          {/* Table Container */}
          <div className="mt-1 bg-white rounded-lg border-[.5px] border-[#85CEE8]">
            {/* Claims Table */}
            <ClaimsTable
              claims={paginatedClaims}
              onClaimClick={handleClaimClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onPatientSignedLetterToggle={handlePatientSignedLetterToggle}
              onAddNew={() =>
                router.push(`${baseNIHBPath}/${category}/add` as any)
              }
              category={category}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedClaim && (
        <ClaimDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedClaim(null);
          }}
          claim={selectedClaim}
          onEdit={() => {
            const id = selectedClaim?.id;
            setIsDetailsModalOpen(false);
            setSelectedClaim(null);
            if (id)
              router.push(`${baseNIHBPath}/${category}/add?id=${id}` as any);
          }}
          onUpdate={async () => {
            await fetchClaims();
            // Find the updated claim in the fetched list and update selectedClaim
            const response = await fetch(`/api/claims?id=${selectedClaim?.id}`);
            const data = await response.json();
            if (data.success && data.claim) {
              setSelectedClaim(data.claim);
            }
          }}
        />
      )}

      {showMetaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {pendingStatus === "authorized"
                  ? "Add Authorization Details"
                  : "Add Case Number"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {pendingStatus === "authorized"
                  ? "Provide the authorization number and end date."
                  : "Provide the case number for this claim."}
              </p>
            </div>

            <div className="space-y-4">
              {pendingStatus === "authorized" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Authorization Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                      value={authNumber}
                      onChange={(e) => setAuthNumber(e.target.value)}
                      placeholder="e.g. 123456"
                    />
                  </div>
                  <label className="mt-2 inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={authIndefinite}
                      onChange={(e) => {
                        setAuthIndefinite(e.target.checked);
                        if (e.target.checked) {
                          setAuthStartDate("");
                          setAuthEndDate("");
                        }
                      }}
                      className="w-4 h-4 text-[#0A438C] border-gray-300 rounded focus:ring-[#0A438C]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Indefinitely authorized</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Authorization Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                    <input
                      type="text"
                      value={authStartDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        const digits = val.replace(/\D/g, "").slice(0, 8);
                        let formatted = digits;
                        if (digits.length > 4) {
                          formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                        }
                        if (digits.length > 6) {
                          formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
                        }
                        setAuthStartDate(formatted);
                      }}
                      placeholder="yyyy-mm-dd"
                      inputMode="numeric"
                      pattern="\\d{4}-\\d{2}-\\d{2}"
                      disabled={authIndefinite}
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900 ${authIndefinite ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'border-gray-300'}`}
                    />
                      <button
                        type="button"
                        onClick={() => openDatePicker("authorizationStartDate")}
                        disabled={authIndefinite}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${authIndefinite ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Authorization End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                    <input
                      type="text"
                      value={authEndDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        const digits = val.replace(/\D/g, "").slice(0, 8);
                        let formatted = digits;
                        if (digits.length > 4) {
                          formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                        }
                        if (digits.length > 6) {
                          formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
                        }
                        setAuthEndDate(formatted);
                      }}
                      placeholder="yyyy-mm-dd"
                      inputMode="numeric"
                      pattern="\\d{4}-\\d{2}-\\d{2}"
                      disabled={authIndefinite}
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900 ${authIndefinite ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'border-gray-300'}`}
                    />
                      <button
                        type="button"
                        onClick={() => openDatePicker("authorizationEndDate")}
                        disabled={authIndefinite}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${authIndefinite ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Case Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="e.g. CN-00001"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowMetaModal(false);
                  setPendingStatus(null);
                  setPendingClaimId(null);
                  setShowDatePicker(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-[#0A438C] text-white hover:bg-[#003366]"
                onClick={async () => {
                  if (!pendingClaimId || !pendingStatus) return;
                  if (
                    (pendingStatus === "authorized" && (!authNumber.trim() || (!authIndefinite && (!authStartDate || !authEndDate)))) ||
                    (pendingStatus === "case-number-open" && !caseNumber.trim())
                  ) {
                    showError("Please fill in the required fields.");
                    return;
                  }
                  try {
                    const body: Record<string, any> = { claimStatus: pendingStatus };
                    if (pendingStatus === "authorized") {
                      body.authorizationNumber = authNumber.trim();
                      body.authorizationStartDate = authIndefinite ? "" : authStartDate; // yyyy-mm-dd
                      body.authorizationEndDate = authIndefinite ? "" : authEndDate; // yyyy-mm-dd
                      body.authorizationIndefinite = authIndefinite;
                    } else if (pendingStatus === "case-number-open") {
                      body.caseNumber = caseNumber.trim();
                    }
                    const resp = await fetch(`/api/claims?id=${pendingClaimId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body),
                    });
                    const data = await resp.json();
                    if (data.success) {
                      showSuccess("Details saved and status updated.");
                      setShowMetaModal(false);
                      setPendingStatus(null);
                      setPendingClaimId(null);
                      setShowDatePicker(false);
                      await fetchClaims();
                    } else {
                      showError(data.error || "Failed to save details");
                    }
                  } catch (e) {
                    console.error(e);
                    showError("Network error. Please try again.");
                  }
                }}
              >
                Save
              </button>
            </div>

            {showDatePicker && (
              <div className="mt-4 p-4 border rounded-lg shadow-sm">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                    onClick={() => navigateMonth("prev")}
                    aria-label="Previous month"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="text-sm font-medium text-gray-700">
                    {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                    onClick={() => navigateMonth("next")}
                    aria-label="Next month"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="p-2 text-center text-xs font-medium text-gray-500">
                      {d}
                    </div>
                  ))}
                  {generateCalendarDays().map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => day.isAvailable && selectDate(day.date)}
                      disabled={!day.isAvailable}
                      className={`p-2 text-xs rounded-lg transition-colors text-center ${
                        day.isAvailable
                          ? day.isToday
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            : day.isCurrentMonth
                            ? "hover:bg-gray-100 text-gray-700"
                            : "text-gray-400 hover:bg-gray-100"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {day.dayNumber}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Download Modal for Diapers & Pads */}
      {showFormDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Download Medical Supplies Forms
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Download the Medical Supplies Form and NIHB presentation page to send to NIHB.
              </p>
            </div>

            <div className="space-y-4">
              {/* Medical Supplies Form */}
              <button
                onClick={async () => {
                  try {
                    const formResponse = await fetch('/prior-approval-form-diapers.pdf');
                    const formBlob = await formResponse.blob();
                    const formUrl = window.URL.createObjectURL(formBlob);
                    const formLink = document.createElement('a');
                    formLink.href = formUrl;
                    formLink.download = 'prior-approval-form-diapers.pdf';
                    document.body.appendChild(formLink);
                    formLink.click();
                    document.body.removeChild(formLink);
                    window.URL.revokeObjectURL(formUrl);

                    // Download NIHB Presentation Page (with a small delay)
                    setTimeout(async () => {
                      try {
                        const presResponse = await fetch('/nihb-presentation-page-medical-supplies.pdf');
                        const presBlob = await presResponse.blob();
                        const presUrl = window.URL.createObjectURL(presBlob);
                        const presLink = document.createElement('a');
                        presLink.href = presUrl;
                        presLink.download = 'nihb-presentation-page-medical-supplies.pdf';
                        document.body.appendChild(presLink);
                        presLink.click();
                        document.body.removeChild(presLink);
                        window.URL.revokeObjectURL(presUrl);
                      } catch (error) {
                        console.error('Failed to download presentation page:', error);
                        showError('Failed to download presentation page. Please try again.');
                      }
                    }, 300);
                  } catch (error) {
                    showError('Failed to download form. Please try again.');
                  }
                }}
                className="w-full flex items-center justify-between p-4 border-2 border-green-300 rounded-lg hover:bg-green-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Medical Supplies Form
                    </p>
                    <p className="text-xs text-gray-500">
                      Includes form and NIHB presentation page
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowFormDownloadModal(false);
                  setPendingFormDownloadClaimId(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
