"use client";

import { useState } from "react";
import { IoDocumentText } from "react-icons/io5";
import StatusBadge from "./StatusBadge";
import TypeBadge from "./TypeBadge";
import ExpiryBadge from "./ExpiryBadge";
import { ClaimDocument } from "./ClaimCard";

interface ClaimsTableProps {
  claims: ClaimDocument[];
  onClaimClick: (claim: ClaimDocument) => void;
  onEdit: (claim: ClaimDocument) => void;
  onDelete: (
    claim: ClaimDocument,
    deletionNote?: string,
    deletedBy?: string
  ) => void;
  onStatusChange?: (
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
  ) => void;
  onPatientSignedLetterToggle?: (
    claimId: string,
    currentValue: boolean
  ) => void;
  onAddNew?: () => void;
  category?: string;
}

export default function ClaimsTable({
  claims,
  onClaimClick,
  onEdit,
  onDelete,
  onStatusChange,
  onPatientSignedLetterToggle,
  onAddNew,
  category,
}: ClaimsTableProps) {
  const isAppeals = category === "appeals";
  const isDiapersPads = category === "diapers-pads";
  const isManualClaims = category === "manual-claims";
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState<ClaimDocument | null>(
    null
  );
  const [deleteNote, setDeleteNote] = useState("");
  const [deletedBy, setDeletedBy] = useState("");

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    // If already yyyy-mm-dd, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  const handleDeleteClick = (claim: ClaimDocument) => {
    setClaimToDelete(claim);
    setShowDeleteModal(true);
    setShowMenu(null);
    setMenuPosition(null);
  };

  const handleConfirmDelete = () => {
    if (claimToDelete && deleteNote.trim() && deletedBy.trim()) {
      onDelete(claimToDelete, deleteNote, deletedBy);
      setShowDeleteModal(false);
      setClaimToDelete(null);
      setDeleteNote("");
      setDeletedBy("");
    }
  };

  // Determine if a claim has incomplete required fields (per category rules)
  const isClaimIncomplete = (claim: ClaimDocument): boolean => {
    // Shared requirements across categories
    const hasAtLeastOneNote = Array.isArray(claim.notes) && claim.notes.length > 0;

    if (claim.category === "manual-claims") {
      const hasBasics = Boolean(
        claim.rxNumber &&
          claim.productName &&
          (claim as any).dinItem &&
          (claim as any).manualClaimType &&
          (claim as any).dateOfRefill
      );
      if (!hasBasics) return true;
      if ((claim as any).manualClaimType === "baby") {
        if (!((claim as any).parentNameOnFile && (claim as any).parentBandNumberUpdated)) return true;
      }
      // Additional requested requirements (documents no longer required)
      if (!hasAtLeastOneNote) return true;
      return false;
    }

    // Non-manual claims
    const hasCore = Boolean(
      claim.rxNumber &&
        claim.productName &&
        claim.prescriberName &&
        claim.prescriberLicense &&
        claim.dateOfPrescription &&
        claim.prescriberFax
    );
    if (!hasCore) return true;

    // DIN requirements per category
    if (claim.category === "diapers-pads") {
      if (!(claim.din && claim.itemNumber)) return true;
    } else {
      if (!(claim.dinItem)) return true;
    }

    // Type required for categories other than appeals and diapers-pads
    if (claim.category !== "appeals" && claim.category !== "diapers-pads") {
      if (!claim.type) return true;
    }

    // Additional requested requirements (documents no longer required)
    if (!hasAtLeastOneNote) return true;

    return false;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
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
              {!isManualClaims && (
                <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                  Prescriber
                </th>
              )}
              <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                {isManualClaims ? "Date of Refill" : "Prescription Date"}
              </th>
              {!isAppeals && !isDiapersPads && !isManualClaims && (
                <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                  Type
                </th>
              )}
              <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                Status
              </th>
              {isAppeals && (
                <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                  Patient Signed
                </th>
              )}
              <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                Authorization Expiry
              </th>
              <th className="px-4 py-3 text-center text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap"></th>
              <th className="px-4 py-3 text-center text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {claims.length === 0 ? (
              <tr>
                <td
                  colSpan={isManualClaims ? 8 : isAppeals || isDiapersPads ? 9 : 10}
                  className="px-4 py-12 text-center"
                >
                  <div className="text-[#888888] text-sm mb-4">No Feedback</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNew?.();
                    }}
                    className="inline-flex items-center space-x-2 bg-[#0A438C] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition-colors shadow"
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
                    <span className="font-medium text-sm">Add New</span>
                  </button>
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr
                  key={claim.id}
                  className="hover:bg-gray-50 transition-colors cursor-default select-none"
                  onDoubleClick={() => onClaimClick(claim)}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="inline-flex items-center">
                      {isClaimIncomplete(claim) && (
                        <span className="mr-2 inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-600" title="Incomplete fields" aria-label="Incomplete fields">
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.59c.75 1.334-.213 2.991-1.742 2.991H3.48c-1.53 0-2.492-1.657-1.742-2.99L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V7a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                      {claim.rxNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {claim.productName}
                  </td>
                  {!isManualClaims && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {claim.prescriberName}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {isManualClaims && (claim as any).dateOfRefill
                      ? formatDate((claim as any).dateOfRefill)
                      : formatDate(claim.dateOfPrescription)}
                  </td>
                  {!isAppeals && !isDiapersPads && !isManualClaims && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <TypeBadge type={claim.type} size="sm" />
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge
                      status={claim.claimStatus}
                      size="sm"
                      category={claim.category}
                      onChange={(newStatus) =>
                        onStatusChange?.(claim.id, newStatus)
                      }
                    />
                  </td>
                  {isAppeals && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {claim.patientSignedLetter ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPatientSignedLetterToggle?.(
                              claim.id,
                              claim.patientSignedLetter || false
                            );
                          }}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
                          title="Click to toggle"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Yes
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPatientSignedLetterToggle?.(
                              claim.id,
                              claim.patientSignedLetter || false
                            );
                          }}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Click to toggle"
                        >
                          No
                        </button>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {(claim as any).authorizationIndefinite ? (
                      <ExpiryBadge endDate="" size="sm" indefinite />
                    ) : claim.authorizationEndDate ? (
                      <ExpiryBadge endDate={claim.authorizationEndDate} size="sm" />
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {claim.documents && (claim.documents as any).length > 0 ? (
                      <a
                        href={(claim.documents as any)[0].filePath}
                        download={(claim.documents as any)[0].filename || ""}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#0A438C] hover:text-[#003366] transition-colors inline-flex items-center justify-center"
                      >
                        <IoDocumentText className="w-5 h-5" />
                      </a>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClaimClick(claim);
                        }}
                        className="text-[#0A438C] hover:text-[#003366] transition-colors inline-flex items-center justify-center"
                      >
                        <IoDocumentText className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="relative inline-block">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = (
                            e.currentTarget as HTMLElement
                          ).getBoundingClientRect();
                          const viewportHeight = window.innerHeight;
                          const menuHeight = 100;
                          const spaceBelow = viewportHeight - rect.bottom;
                          const spaceAbove = rect.top;

                          const showAbove =
                            spaceBelow < menuHeight && spaceAbove > spaceBelow;

                          setMenuPosition({
                            x: rect.right - 160,
                            y: showAbove
                              ? rect.top - menuHeight + 6
                              : rect.bottom + 4,
                          });
                          setShowMenu(showMenu === claim.id ? null : claim.id);
                        }}
                        className="text-[#888888] hover:text-gray-900 transition-colors"
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
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Fixed dropdown outside table overflow */}
      {showMenu && menuPosition && (
        <>
          <div
            className="fixed w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
              zIndex: 9999,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                const claim = claims.find((c) => c.id === showMenu);
                if (claim) onEdit(claim);
                setShowMenu(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-3 text-sm text-[#0A438C] font-[300] hover:bg-gray-50"
            >
              Edit Claim
            </button>
            <div className="border-t border-gray-200"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const claim = claims.find((c) => c.id === showMenu);
                if (claim) onClaimClick(claim);
                setShowMenu(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-3 text-sm text-[#0A438C] font-[300] hover:bg-gray-50"
            >
              View Claim
            </button>
            <div className="border-t border-gray-200"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const claim = claims.find((c) => c.id === showMenu);
                if (claim) handleDeleteClick(claim);
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-600 font-[300] hover:bg-gray-50"
            >
              Delete Claim
            </button>
          </div>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => {
              setShowMenu(null);
              setMenuPosition(null);
            }}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center"
            onClick={() => {
              setShowDeleteModal(false);
              setClaimToDelete(null);
              setDeleteNote("");
              setDeletedBy("");
            }}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Claim
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this claim? This action cannot
                be undone.
              </p>
              {claimToDelete && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-gray-900">
                    {claimToDelete.rxNumber} - {claimToDelete.productName}
                  </p>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deleted By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deletedBy}
                  onChange={(e) => setDeletedBy(e.target.value)}
                  placeholder="Enter your name or username..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900 mb-4"
                />
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for deletion <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deleteNote}
                  onChange={(e) => setDeleteNote(e.target.value)}
                  placeholder="Enter a note explaining why this claim is being deleted..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none placeholder:text-gray-400 text-gray-900 resize-none"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setClaimToDelete(null);
                    setDeleteNote("");
                    setDeletedBy("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={!deleteNote.trim() || !deletedBy.trim()}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                    deleteNote.trim() && deletedBy.trim()
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Delete Claim
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
