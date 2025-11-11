"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface RequestDetailsModalProps {
  request: any;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function RequestDetailsModal({
  request,
  onClose,
  onUpdateStatus,
}: RequestDetailsModalProps) {
  const isRefill = request.type === "refill";
  const [newStatus, setNewStatus] = useState(request.status);
  const [enablePrinting, setEnablePrinting] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    // Fetch settings to check if printing is enabled
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setEnablePrinting(data.settings.enablePrinting !== false);
        }
      })
      .catch(() => {
        // Default to enabled if fetch fails
        setEnablePrinting(true);
      });
  }, []);

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // If it's a 10-digit number, format as (XXX) XXX-XXXX
    if (digits.length === 10) {
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // If it already has country code, format accordingly
    if (digits.length === 11 && digits.startsWith('1')) {
      const withoutCountryCode = digits.slice(1);
      return `+1 (${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(3, 6)}-${withoutCountryCode.slice(6)}`;
    }
    
    // Return as is if it doesn't match expected formats
    return phone;
  };

  const handleUpdateStatus = () => {
    onUpdateStatus(request.id, newStatus);
    onClose();
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Fetch PDF from API
      const response = await fetch(`/api/requests/${request.id}/print`);
      
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Failed to generate PDF";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/pdf")) {
        throw new Error("Invalid response format. Expected PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            URL.revokeObjectURL(url);
          }, 250);
        };
      } else {
        // If popup blocked, create a download link
        const link = document.createElement("a");
        link.href = url;
        link.download = `request-${request.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to generate PDF for printing:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate PDF for printing. Please try again.";
      alert(errorMessage);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">
                  {isRefill ? "💊" : "🩺"}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isRefill ? "Refill Request" : "Consultation Request"}
                </h2>
                <p className="text-sm text-gray-500">ID: {request.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Status Update */}
          <div className="">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  Status:
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="appearance-none bg-white border-2 border-gray-300 rounded-lg px-2 py-1 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={handleUpdateStatus}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
          <hr className="my-4" />
          {/* Contact Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <p className="text-sm text-gray-900">{formatPhoneNumber(request.phone)}</p>
          </div>
          <hr className="my-4" />
          {/* Request-specific details */}
          {isRefill ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Prescription Details
              </h3>

              {/* Prescriptions */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescriptions
                </label>
                <div className="space-y-2">
                  {(request as any).prescriptions
                    .filter((rx: string) => rx.trim())
                    .map((rx: string, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded border"
                      >
                        <span className="text-sm text-gray-900">{rx}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Type
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {(request as any).deliveryType}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Time
                  </label>
                  <p className="text-sm text-gray-900">
                    {(request as any).estimatedTime || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Comments */}
              {(request as any).comments && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments
                  </label>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm text-gray-900">
                      {(request as any).comments}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* <h3 className="text-lg font-medium text-gray-900 mb-3">Consultation Details</h3> */}
              <hr className="my-4" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {(request as any).service}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date/Time
                  </label>
                  <p className="text-sm text-gray-900">
                    {(request as any).preferredDateTime || "Not specified"}
                  </p>
                </div>
              </div>
              <hr className="my-4" />
              {(request as any).additionalNote && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm text-gray-900">
                      {(request as any).additionalNote}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <span className="text-sm text-gray-600">
            Created: {new Date(request.createdAt).toLocaleString()}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              disabled={!enablePrinting || isPrinting}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all ${
                enablePrinting
                  ? "text-white bg-[#0A438C] border border-[#0A438C] hover:bg-[#0A438C]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  : "text-gray-400 bg-gray-200 border border-gray-300 cursor-not-allowed"
              }`}
              title={!enablePrinting ? "Printing is disabled in settings" : ""}
            >
              {isPrinting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
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
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  <span>Print</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
