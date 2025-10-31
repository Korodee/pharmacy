"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RequestData } from "../api/requests/route";
import { useToast } from "../../components/ui/ToastProvider";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PageHeader from "../../components/layout/PageHeader";
import StatisticsCards from "../../components/admin/StatisticsCards";
import SearchAndFilter from "../../components/admin/SearchAndFilter";
import RequestCard from "../../components/admin/RequestCard";
import RequestDetailsModal from "../../components/admin/RequestDetailsModal";

export default function WebOrdersPage() {
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/requests");
      const data = await response.json();

      if (data.success) {
        setRequests(data.requests);
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
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      // In a real app, you'd make an API call to update the status
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: status as any } : req
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Statistics calculations
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    inProgress: requests.filter((r) => r.status === "in-progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
    refills: requests.filter((r) => r.type === "refill").length,
    consultations: requests.filter((r) => r.type === "consultation").length,
  };

  // Filter requests based on search and filters
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getTypeIcon = (type: string) => {
    return type === "refill" ? "💊" : "🩺";
  };

  const getTypeColor = (type: string) => {
    return type === "refill"
      ? "bg-blue-50 border-blue-200"
      : "bg-purple-50 border-purple-200";
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <LoadingSpinner size="lg" className="text-[#0A438C] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Dashboard
            </h3>
            <p className="text-gray-600">Fetching your requests...</p>
          </div>
        </motion.div>
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
      <PageHeader
        title="Web Orders"
        description="Manage refill and consultation requests from customers"
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Statistics Cards */}
        <StatisticsCards
          totalRequests={stats.total}
          pendingRequests={stats.pending}
          inProgressRequests={stats.inProgress}
          completedRequests={stats.completed}
        />

        {/* Requests Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mt-6"
        >
          {/* Section Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Requests</h2>
                  <p className="text-sm text-gray-600">
                    {filteredRequests.length} of {requests.length} requests
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Search & Filter */}
          <SearchAndFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
          />
          {/* Requests List */}
          <div className="px-6 py-3">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No requests found
                </h3>
                <p className="text-gray-500">
                  {requests.length === 0
                    ? "Requests will appear here when users submit them."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredRequests.map((request, index) => (
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
            )}
          </div>
        </motion.div>
      </div>

      {/* Request Details Modal */}
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

// Helper function for status colors (used in main component)
const getStatusColor = (status: string) => {
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
};
