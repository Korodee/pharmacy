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
  prescriberPhone?: string;
  dateOfPrescription: string;
  type: "new" | "renewal" | "prior-authorization";
  claimStatus: "new" | "case-number-open" | "authorized" | "denied";
  caseNumber?: string;
  authorizationNumber?: string;
  authorizationStartDate?: string;
  authorizationEndDate?: string;
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
              <h3 className="text-lg font-semibold text-gray-900">
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
              <StatusBadge status={claim.claimStatus} size="sm" />
              <TypeBadge type={claim.type} size="sm" />
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
