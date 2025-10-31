"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/ToastProvider";
import LoadingSpinner from "../ui/LoadingSpinner";
import StatusBadge from "./StatusBadge";
import TypeBadge from "./TypeBadge";
import ExpiryBadge from "./ExpiryBadge";
import NoteItem from "./NoteItem";
import { ClaimDocument } from "./ClaimCard";

interface Note {
  id: string;
  text: string;
  staffUsername: string;
  timestamp: string;
}

interface ClaimDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: ClaimDocument;
  onEdit: () => void;
  onUpdate: () => void;
}

export default function ClaimDetailsModal({
  isOpen,
  onClose,
  claim,
  onEdit,
  onUpdate,
}: ClaimDetailsModalProps) {
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusUpdate = async (
    newStatus: "new" | "case-number-open" | "authorized"
  ) => {
    try {
      const response = await fetch("/api/claims", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: claim.id,
          claimStatus: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("Claim status updated successfully");
        onUpdate();
      } else {
        showError(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showError("Network error. Please try again.");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      showError("Note cannot be empty");
      return;
    }

    setIsAddingNote(true);

    try {
      const response = await fetch("/api/claims/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimId: claim.id,
          text: newNote,
          staffUsername: "Admin User", // TODO: Get from auth context
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("Note added successfully");
        setNewNote("");
        onUpdate();
      } else {
        showError(data.error || "Failed to add note");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      showError("Network error. Please try again.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setIsDeletingNote(noteId);

    try {
      const response = await fetch(
        `/api/claims/notes?claimId=${claim.id}&noteId=${noteId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        showSuccess("Note deleted successfully");
        onUpdate();
      } else {
        showError(data.error || "Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      showError("Network error. Please try again.");
    } finally {
      setIsDeletingNote(null);
    }
  };

  const handleTogglePriority = async () => {
    try {
      const response = await fetch("/api/claims", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: claim.id,
          priority: !claim.priority,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(
          claim.priority ? "Priority removed" : "Claim marked as priority"
        );
        onUpdate();
      } else {
        showError(data.error || "Failed to update priority");
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      showError("Network error. Please try again.");
    }
  };

  if (!isOpen) return null;

  const getCategoryDisplayName = () => {
    const categoryMap: Record<string, string> = {
      medications: "Medications",
      appeals: "Appeals",
      "manual-claims": "Manual Claims",
      "diapers-pads": "Diapers & Pads",
    };
    return categoryMap[claim.category] || claim.category;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-3 items-center">
              <div />
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900">View Claim</h2>
                <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">Created • {formatDateTime(claim.createdAt)}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 shadow-sm"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className="p-6 overflow-y-auto"
            style={{ maxHeight: "calc(90vh - 220px)" }}
          >
            {/* Claim Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-600">Rx Number</span>
                <span className="text-sm font-medium text-gray-900">
                  {claim.rxNumber}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-600">Product Name</span>
                <span className="text-sm font-medium text-gray-900">
                  {claim.productName}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-600">Prescriber</span>
                <span className="text-sm font-medium text-gray-900">
                  {claim.prescriberName}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-600">Prescriber License</span>
                <span className="text-sm font-medium text-gray-900">{claim.prescriberLicense}</span>
              </div>

              {claim.prescriberFax && (
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-600">Prescriber Fax</span>
                  <span className="text-sm font-medium text-gray-900">{claim.prescriberFax}</span>
                </div>
              )}

              {claim.prescriberPhone && (
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-600">Prescriber Phone</span>
                  <span className="text-sm font-medium text-gray-900">{claim.prescriberPhone}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-600">Prescription Date</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(claim.dateOfPrescription)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-600">Prescription Type</span>
                <span className="text-sm font-medium text-gray-900">
                  <TypeBadge type={claim.type} size="sm" />
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-medium text-gray-900">
                  <StatusBadge status={claim.claimStatus} size="sm" />
                </span>
              </div>
            </div>

            {/* Documents link */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-600">Documents</span>
              <a
                href={claim.documents && (claim.documents as any).length > 0 ? (claim.documents as any)[0].filePath : '#'}
                download={claim.documents && (claim.documents as any).length > 0 ? (claim.documents as any)[0].filename : undefined}
                className="flex items-center text-sm text-[#0A438C] hover:underline"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                View Documents
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-white">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onClose}
                className="px-10 py-3 rounded-md bg-[#EAF3F8] hover:bg-[#E1EEF6] text-[#0A438C] text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={onEdit}
                className="px-10 py-3 rounded-md bg-[#0A438C] hover:bg-[#003366] text-white text-sm font-medium"
              >
                Edit Claim
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
