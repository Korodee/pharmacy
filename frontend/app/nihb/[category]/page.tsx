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
  const baseNIHBPath = pathname && pathname.includes('/admin/nihb') ? '/admin/nihb' : '/nihb';
  const { showSuccess, showError } = useToast();
  const [claims, setClaims] = useState<ClaimDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<ClaimDocument | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [prescriberFilter, setPrescriberFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
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

  const handleDelete = async (claim: ClaimDocument, deletionNote?: string, deletedBy?: string) => {
    try {
      const response = await fetch(`/api/claims?id=${claim.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deletionNote: deletionNote || '', deletedBy: deletedBy || '' }),
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

  const handleStatusChange = async (claimId: string, newStatus: 'new' | 'case-number-open' | 'authorized' | 'denied' | 'patient-signed-letter' | 'letter-sent-to-doctor' | 'awaiting-answer') => {
    try {
      const response = await fetch(`/api/claims?id=${claimId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimStatus: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        if (newStatus === 'authorized') {
          showSuccess("Status updated successfully. Please update authorization start and end dates.", 8000);
          router.push(`${baseNIHBPath}/${category}/add?id=${claimId}` as any);
          return;
        } else if (newStatus === 'case-number-open') {
          showSuccess("Status updated successfully. Please add the case number.", 8000);
          router.push(`${baseNIHBPath}/${category}/add?id=${claimId}` as any);
          return;
        } else {
          showSuccess("Status updated successfully.", 6000);
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
      if (dateFilter === "all") return true;
      const claimDate = new Date(claim.dateOfPrescription);
      const now = new Date();
      const diffTime = now.getTime() - claimDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      switch (dateFilter) {
        case "today":
          return diffDays < 1;
        case "week":
          return diffDays < 7;
        case "month":
          return diffDays < 30;
        case "year":
          return diffDays < 365;
        default:
          return true;
      }
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
            onClick={() => router.push(`${baseNIHBPath}/${category}/add` as any)}
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
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            prescriberFilter={prescriberFilter}
            onPrescriberChange={setPrescriberFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            productFilter={productFilter}
            onProductChange={setProductFilter}
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
              onAddNew={() => router.push(`${baseNIHBPath}/${category}/add` as any)}
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
            if (id) router.push(`${baseNIHBPath}/${category}/add?id=${id}` as any);
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
    </>
  );
}
