"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RequestData } from "../../api/requests/route";
import { useToast } from "../../../components/ui/ToastProvider";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import PageHeader from "../../../components/layout/PageHeader";
import StatisticsCards from "../../../components/admin/StatisticsCards";
import SearchAndFilter from "../../../components/admin/SearchAndFilter";
import RequestCard from "../../../components/admin/RequestCard";
import RequestDetailsModal from "../../../components/admin/RequestDetailsModal";

export default function WebOrdersPage() {
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
  const [enableNotifications, setEnableNotifications] = useState(false);
  
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
        
        // Find requests that we haven't seen before
        const unseenRequests = newRequests.filter(
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
        setRequests(fetchedRequests);
        
        // Mark all current requests as seen
        fetchedRequests.forEach((req) => {
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

  const updateRequestStatus = useCallback((requestId: string, status: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: status as any } : req
      )
    );
  }, []);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    inProgress: requests.filter((r) => r.status === "in-progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
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
      <PageHeader title="Web Orders" />

      <div className="flex-1 overflow-auto pl-4 pr-6 py-6">
        <StatisticsCards
          totalRequests={stats.total}
          pendingRequests={stats.pending}
          inProgressRequests={stats.inProgress}
          completedRequests={stats.completed}
        />

        {/* Requests Section */}
        <div className="mt-6">
          {/* Section Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Requests</h2>
            <p className="text-sm text-gray-600">
              {filteredRequests.length} of {requests.length} requests
            </p>
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
          <div className="mt-4">
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

