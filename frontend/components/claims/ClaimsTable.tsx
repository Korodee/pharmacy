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
  onDelete: (claim: ClaimDocument) => void;
  onStatusChange?: (
    claimId: string,
    newStatus: "new" | "case-number-open" | "authorized" | "denied" | "patient-signed-letter" | "letter-sent-to-doctor" | "awaiting-answer"
  ) => void;
  onAddNew?: () => void;
}

export default function ClaimsTable({
  claims,
  onClaimClick,
  onEdit,
  onDelete,
  onStatusChange,
  onAddNew,
}: ClaimsTableProps) {
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
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
              <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                Prescriber
              </th>
              <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                Prescription Date
              </th>
              <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                Type
              </th>
              <th className="px-4 py-3 text-left text-[13px] font-medium text-[#888292] tracking-wider whitespace-nowrap">
                Status
              </th>
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
                <td colSpan={9} className="px-4 py-12 text-center">
                  <div className="text-[#888888] text-sm mb-4">No Feedback</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNew?.();
                    }}
                    className="inline-flex items-center space-x-2 bg-[#0A438C] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition-colors shadow"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                  <td className="px-4 py-3 whitespace-nowrap">
                    <TypeBadge type={claim.type} size="sm" />
                  </td>
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
                  <td className="px-4 py-3 whitespace-nowrap">
                    {claim.authorizationEndDate ? (
                      <ExpiryBadge
                        endDate={claim.authorizationEndDate}
                        size="sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {claim.documents && (claim.documents as any).length > 0 ? (
                      <a
                        href={(claim.documents as any)[0].filePath}
                        download={(claim.documents as any)[0].filename || ''}
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
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          const viewportHeight = window.innerHeight;
                          const menuHeight = 100;
                          const spaceBelow = viewportHeight - rect.bottom;
                          const spaceAbove = rect.top;
                          
                          const showAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;
                          
                          setMenuPosition({
                            x: rect.right - 160,
                            y: showAbove ? rect.top - menuHeight + 6 : rect.bottom + 4,
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
                const claim = claims.find(c => c.id === showMenu);
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
                const claim = claims.find(c => c.id === showMenu);
                if (claim) onClaimClick(claim);
                setShowMenu(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-3 text-sm text-[#0A438C] font-[300] hover:bg-gray-50"
            >
              View Claim
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
    </div>
  );
}
