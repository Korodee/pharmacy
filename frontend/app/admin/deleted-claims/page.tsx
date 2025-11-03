"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/ui/ToastProvider";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import PageHeader from "../../../components/layout/PageHeader";
import { ClaimDocument } from "../../../components/claims/ClaimCard";

interface ArchivedClaimDocument extends ClaimDocument {
  archivedAt: string;
  deletionNote: string;
  archivedBy: string;
}

export default function DeletedClaimsPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [claims, setClaims] = useState<ArchivedClaimDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<ArchivedClaimDocument | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/claims/archived`);
      const data = await response.json();

      if (data.success) {
        setClaims(data.claims);
      } else {
        showError("Failed to fetch deleted claims");
      }
    } catch (err) {
      console.error("Error fetching deleted claims:", err);
      showError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewNote = (claim: ArchivedClaimDocument) => {
    setSelectedClaim(claim);
    setShowNoteModal(true);
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto pl-4 pr-6 py-6">
        <PageHeader title="Deleted Claims" />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Deleted Claims" />

      <div className="flex-1 overflow-auto pl-4 pr-6 py-6">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full" style={{ minWidth: "max-content" }}>
              <thead className="bg-[#F1FAFD]">
                <tr>
                  <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                    RX Number
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                    Prescriber
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                    Prescription Date
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                    Deleted At
                  </th>
                  <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                    Deleted By
                  </th>
                  <th className="px-4 py-3 text-center text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                    View Note
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="text-[#888888] text-sm">No deleted claims</div>
                    </td>
                  </tr>
                ) : (
                  claims.map((claim) => (
                    <tr
                      key={claim.id}
                      className="hover:bg-gray-50 transition-colors cursor-default select-none"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {claim.rxNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {claim.productName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {claim.prescriberName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(claim.dateOfPrescription)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 capitalize">
                        {claim.category.replace('-', ' ')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {formatDateTime(claim.archivedAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {claim.archivedBy}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewNote(claim)}
                          className="text-[#0A438C] hover:text-[#003366] transition-colors px-3 py-1 rounded hover:bg-blue-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && selectedClaim && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowNoteModal(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Deletion Note
                  </h3>
                  <button
                    onClick={() => setShowNoteModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">RX Number:</span>
                      <p className="text-gray-900">{selectedClaim.rxNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Product:</span>
                      <p className="text-gray-900">{selectedClaim.productName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Deleted At:</span>
                      <p className="text-gray-900">{formatDateTime(selectedClaim.archivedAt)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Deleted By:</span>
                      <p className="text-gray-900">{selectedClaim.archivedBy}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Deletion
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedClaim.deletionNote || "No note provided"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowNoteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#0A438C] rounded-lg hover:bg-[#003366] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

