"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RequestData } from "@/app/api/requests/route";
import { useToast } from "../../../../components/ui/ToastProvider";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import PageHeader from "../../../../components/layout/PageHeader";
import SearchAndFilter from "../../../../components/admin/SearchAndFilter";
import RequestCard from "../../../../components/admin/RequestCard";
import RequestDetailsModal from "../../../../components/admin/RequestDetailsModal";
import Pagination from "../../../../components/claims/Pagination";

export default function CompletedRequestsPage() {
  const { showError, showInfo } = useToast();
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [statusFilter] = useState("completed"); // Always completed for this page
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/requests");
      const data = await response.json();

      if (data.success) {
        const fetchedRequests = data.requests as RequestData[];
        // Only show completed requests
        const completedRequests = fetchedRequests.filter(req => req.status === "completed");
        setRequests(completedRequests);
      } else {
        setError(data.error || "Failed to fetch requests");
        showError("Failed to fetch requests");
      }
    } catch (err) {
      setError("Failed to fetch requests");
      showError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateRequestStatus = useCallback(async (requestId: string, status: string) => {
    try {
      // Update status in database
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        // If status is changed from completed, remove from this page
        if (status !== "completed") {
          setRequests((prev) => prev.filter((req) => req.id !== requestId));
          showInfo("Request status changed. It has been moved to the requests page.");
        } else {
          // Update local state for completed status
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId ? { ...req, status: status as any } : req
            )
          );
        }
      } else {
        showError(data.error || "Failed to update request status");
      }
    } catch (error) {
      showError("Failed to update request status");
    }
  }, [showError]);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || request.type === typeFilter;
    const matchesDelivery =
      deliveryFilter === "all" ||
      (request.type === "refill" && request.deliveryType === deliveryFilter);

    return matchesSearch && matchesType && matchesDelivery;
  });

  // Sort requests based on sortBy option
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      // Sort by newest first (default)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / rowsPerPage));
  const paginatedRequests = sortedRequests.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, deliveryFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-[#0A438C] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Completed Requests
          </h3>
          <p className="text-gray-600">Fetching completed requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connection Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchRequests}
              className="bg-[#0A438C] text-white px-6 py-3 rounded-xl hover:bg-[#0A438C]/90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Web Orders" />

      <div className="flex-1 overflow-auto pl-4 pr-6 py-6">
        {/* Requests Section */}
        <div>
          {/* Section Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Completed Requests</h2>
              <p className="text-sm text-gray-600">
                {sortedRequests.length} of {requests.length} completed requests
              </p>
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
                className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-[#0A438C] bg-white text-black appearance-none cursor-pointer hover:border-gray-400 transition-colors text-sm font-medium"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
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
          </div>

          {/* Search & Filter */}
          <SearchAndFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={() => {}} // Status is always completed, no-op
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            deliveryFilter={deliveryFilter}
            setDeliveryFilter={setDeliveryFilter}
            showCompleted={false}
          />

          {/* Requests List */}
          <div className="mt-4">
            {sortedRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No completed requests found
                </h3>
                <p className="text-gray-500">
                  {requests.length === 0
                    ? "Completed requests will appear here."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <AnimatePresence>
                    {paginatedRequests.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <RequestCard
                          request={request}
                          onClick={() => setSelectedRequest(request)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

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
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <RequestDetailsModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onUpdateStatus={updateRequestStatus}
          />
        )}
      </AnimatePresence>
    </>
  );
}

