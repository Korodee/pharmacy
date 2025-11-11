"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RequestData } from "@/app/api/requests/route";
import { useToast } from "../../../../components/ui/ToastProvider";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import PageHeader from "../../../../components/layout/PageHeader";
import StatisticsCards from "../../../../components/admin/StatisticsCards";
import SearchAndFilter from "../../../../components/admin/SearchAndFilter";
import RequestCard from "../../../../components/admin/RequestCard";
import RequestDetailsModal from "../../../../components/admin/RequestDetailsModal";
import Pagination from "../../../../components/claims/Pagination";
import { useRouter } from "next/navigation";

export default function WebOrdersRequestsPage() {
  const router = useRouter();
  const { showError, showInfo } = useToast();
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "urgent">("newest");
  const [enableNotifications, setEnableNotifications] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Track which request IDs we've already seen for notifications
  const seenRequestIds = useRef<Set<string>>(new Set());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Get or create audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    return audioContextRef.current;
  }, []);

  const fetchNotificationSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      
      if (data.success && data.settings) {
        setEnableNotifications(data.settings.enableNotifications === true);
      }
    } catch (err) {
      // Silently fail - notifications will be disabled if settings can't be fetched
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(async () => {
    try {
      const audioContext = getAudioContext();
      if (!audioContext) {
        return;
      }
      
      // Resume audio context if it's suspended (required by browser autoplay policies)
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch {
          // If resume fails, the user hasn't interacted with the page yet
          return;
        }
      }
      
      // Create a pleasant notification sound (two-tone chime)
      const playTone = (frequency: number, duration: number, startTime: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Fade in and out for a smoother sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      const now = audioContext.currentTime;
      // Play two tones: a pleasant chime sound
      playTone(800, 0.2, now);
      playTone(1000, 0.2, now + 0.1);
    } catch {
      // Silently fail if audio context is not available or if autoplay is blocked
    }
  }, [getAudioContext]);

  const checkForNewRequests = useCallback(async () => {
    if (!enableNotifications) {
      return;
    }

    try {
      const response = await fetch("/api/requests");
      const data = await response.json();

      if (data.success && data.requests) {
        const newRequests = data.requests as RequestData[];
        
        // Filter out completed requests for notifications
        const activeRequests = newRequests.filter(req => req.status !== "completed");
        
        // Find requests that we haven't seen before
        const unseenRequests = activeRequests.filter(
          (req) => !seenRequestIds.current.has(req.id)
        );

        // Show notifications for new requests
        if (unseenRequests.length > 0) {
          // Play notification sound once for all new requests
          playNotificationSound();
          
          unseenRequests.forEach((request) => {
            // Mark as seen immediately to prevent duplicate notifications
            seenRequestIds.current.add(request.id);
            
            const requestType = request.type === "refill" ? "Refill" : "Consultation";
            const phone = request.phone.replace(/\D/g, '');
            const formattedPhone = phone.length === 10 
              ? `+1 (${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
              : request.phone;
            
            showInfo(
              `🔔 New ${requestType} Request Received! Phone: ${formattedPhone}`,
              8000
            );
          });

          // Update the requests list - prepend new requests at the top
          setRequests((prevRequests) => {
            const existingIds = new Set(prevRequests.map(r => r.id));
            const newRequestsToAdd = unseenRequests.filter(r => !existingIds.has(r.id));
            
            return [...newRequestsToAdd, ...prevRequests];
          });
        }
      }
    } catch {
      // Silently fail - polling will retry on next interval
    }
  }, [enableNotifications, playNotificationSound, showInfo]);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/requests");
      const data = await response.json();

      if (data.success) {
        const fetchedRequests = data.requests as RequestData[];
        // Filter out completed requests - they go to the completed page
        const activeRequests = fetchedRequests.filter(req => req.status !== "completed");
        setRequests(activeRequests);
        
        // Mark all current requests as seen
        activeRequests.forEach((req) => {
          seenRequestIds.current.add(req.id);
        });
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
    fetchNotificationSettings();
    
    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchRequests, fetchNotificationSettings]);

  // Set up polling when notifications are enabled
  useEffect(() => {
    if (enableNotifications) {
      // Poll every 5 seconds for new requests
      pollingIntervalRef.current = setInterval(() => {
        checkForNewRequests();
      }, 5000);
    } else {
      // Clear polling when notifications are disabled
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [enableNotifications, checkForNewRequests]);

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
        // If status is completed, remove from active requests
        if (status === "completed") {
          setRequests((prev) => prev.filter((req) => req.id !== requestId));
          showInfo("Request marked as completed and moved to completed requests");
        } else {
          // Update local state for other status changes
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
  }, [showInfo, showError]);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    inProgress: requests.filter((r) => r.status === "in-progress").length,
  };

  // Helper function to get urgency score for sorting
  const getUrgencyScore = (request: RequestData): number => {
    if (request.type !== "refill" || !request.estimatedTime) {
      return 999; // Non-refill requests or requests without estimated time go to the end
    }

    const estimatedTime = (request as any).estimatedTime?.toLowerCase() || "";
    const now = new Date();
    const currentHour = now.getHours();

    // Parse common time patterns
    if (estimatedTime.includes("noon") || estimatedTime.includes("12")) {
      // Noon deliveries: most urgent if it's before 12 PM
      return currentHour < 12 ? 1 : 100;
    }
    if (estimatedTime.includes("morning") || estimatedTime.includes("am")) {
      // Morning deliveries: urgent if it's still morning
      return currentHour < 12 ? 2 : 101;
    }
    if (estimatedTime.includes("afternoon") || estimatedTime.includes("pm")) {
      // Afternoon deliveries
      return currentHour < 17 ? 3 : 102;
    }
    if (estimatedTime.includes("evening")) {
      // Evening deliveries
      return currentHour < 20 ? 4 : 103;
    }
    // Parse hour-based times (e.g., "2-3 hours", "1 hour")
    const hourMatch = estimatedTime.match(/(\d+)\s*hour/);
    if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      // Shorter time = more urgent
      return hours;
    }
    // Default: less urgent
    return 50;
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.type === typeFilter;
    const matchesDelivery =
      deliveryFilter === "all" ||
      (request.type === "refill" && request.deliveryType === deliveryFilter);

    return matchesSearch && matchesStatus && matchesType && matchesDelivery;
  });

  // Sort requests based on sortBy option
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === "urgent") {
      const urgencyA = getUrgencyScore(a);
      const urgencyB = getUrgencyScore(b);
      // Lower urgency score = more urgent (sort ascending)
      if (urgencyA !== urgencyB) {
        return urgencyA - urgencyB;
      }
      // If same urgency, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
  }, [searchTerm, statusFilter, typeFilter, deliveryFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-[#0A438C] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Dashboard
          </h3>
          <p className="text-gray-600">Fetching your requests...</p>
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
        <StatisticsCards
          totalRequests={stats.total}
          pendingRequests={stats.pending}
          inProgressRequests={stats.inProgress}
        />

        {/* Requests Section */}
        <div className="mt-6">
          {/* Section Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Active Requests</h2>
              <p className="text-sm text-gray-600">
                {sortedRequests.length} of {requests.length} requests
              </p>
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "urgent")}
                className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-[#0A438C] bg-white text-black appearance-none cursor-pointer hover:border-gray-400 transition-colors text-sm font-medium"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="urgent">Sort: Most Urgent First</option>
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
            setStatusFilter={setStatusFilter}
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

