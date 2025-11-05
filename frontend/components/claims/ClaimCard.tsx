"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import StatusBadge from "./StatusBadge";
import TypeBadge from "./TypeBadge";
import ExpiryBadge from "./ExpiryBadge";

interface ClaimDocument {
  id: string;
  category: "medications" | "appeals" | "manual-claims" | "diapers-pads";
  rxNumber: string;
  productName: string;
  prescriberName: string;
  prescriberLicense: string;
  prescriberFax?: string;
  dinItem?: string;
  dateOfPrescription: string;
  type: "new" | "renewal" | "prior-authorization";
  claimStatus:
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
    | "payment-received";
  patientSignedLetter?: boolean;
  din?: string;
  itemNumber?: string;
  caseNumber?: string;
  authorizationNumber?: string;
  authorizationStartDate?: string;
  authorizationEndDate?: string;
  // Manual claims specific fields
  manualClaimType?: "baby" | "old";
  parentNameOnFile?: boolean;
  parentBandNumberUpdated?: boolean;
  dateOfRefill?: string;
  documents: Array<{
    filename: string;
    filePath: string;
    uploadDate: string;
    type: string;
  }>;
  notes?: Array<{
    id: string;
    text: string;
    staffUsername: string;
    timestamp: string;
  }>;
  statusHistory?: Array<{
    fromStatus: string;
    toStatus: string;
    changedAt: string;
    changedBy?: string;
  }>;
  priority: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClaimCardProps {
  claim: ClaimDocument;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ClaimCard({
  claim,
  onClick,
  onEdit,
  onDelete,
}: ClaimCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Mirror table logic: determine if claim is incomplete per category
  const isClaimIncomplete = (c: ClaimDocument): boolean => {
    const hasAtLeastOneNote = Array.isArray(c.notes) && c.notes.length > 0;

    if (c.category === "manual-claims") {
      const hasBasics = Boolean(
        c.rxNumber &&
          c.productName &&
          (c as any).dinItem &&
          (c as any).manualClaimType &&
          (c as any).dateOfRefill
      );
      if (!hasBasics) return true;
      if ((c as any).manualClaimType === "baby") {
        if (!((c as any).parentNameOnFile && (c as any).parentBandNumberUpdated)) return true;
      }
      if (!hasAtLeastOneNote) return true;
      return false;
    }

    const hasCore = Boolean(
      c.rxNumber &&
        c.productName &&
        c.prescriberName &&
        c.prescriberLicense &&
        c.dateOfPrescription &&
        c.prescriberFax
    );
    if (!hasCore) return true;

    if (c.category === "diapers-pads") {
      if (!(c.din && c.itemNumber)) return true;
    } else {
      if (!(c.dinItem)) return true;
    }

    if (c.category !== "appeals" && c.category !== "diapers-pads") {
      if (!c.type) return true;
    }

    if (!hasAtLeastOneNote) return true;

    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                {isClaimIncomplete(claim) && (
                  <span
                    className="mr-2 inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-600"
                    title="Incomplete fields"
                    aria-label="Incomplete fields"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.59c.75 1.334-.213 2.991-1.742 2.991H3.48c-1.53 0-2.492-1.657-1.742-2.99L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V7a1 1 0 112 0v4a1 1 0 01-1 1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
                {claim.rxNumber}
              </h3>
              {claim.priority && (
                <span className="text-red-500" title="Priority">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </span>
              )}
              <StatusBadge
                status={claim.claimStatus}
                size="sm"
                category={claim.category}
              />
              {claim.category !== "appeals" && (
                <TypeBadge type={claim.type} size="sm" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {claim.productName}
            </p>
            <p className="text-sm text-gray-600">
              {claim.prescriberName} ({claim.prescriberLicense})
            </p>
          </div>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
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

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  <span className="mr-2">👁️</span>
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <span className="mr-2">✏️</span>
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                >
                  <span className="mr-2">🗑️</span>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>📅 {formatDate(claim.dateOfPrescription)}</span>
            {claim.authorizationEndDate && (
              <div className="flex items-center space-x-2">
                <span>Expires:</span>
                <ExpiryBadge endDate={claim.authorizationEndDate} size="sm" />
              </div>
            )}
          </div>

          {claim.documents && claim.documents.length > 0 && (
            <div className="flex items-center space-x-2 text-blue-600">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium">
                {claim.documents.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />
      )}
    </motion.div>
  );
}

export type { ClaimDocument };
