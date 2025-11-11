"use client";

import { motion } from "framer-motion";

interface RequestCardProps {
  request: any;
  onClick: () => void;
}

function getTypeColor(type: string): string {
  return type === "refill"
    ? "bg-blue-50 border-blue-200"
    : "bg-purple-50 border-purple-200";
}

function getStatusColor(status: string): string {
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
}

function getTypeIcon(type: string): string {
  return type === "refill" ? "💊" : "🩺";
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString();
}

export default function RequestCard({ request, onClick }: RequestCardProps) {
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, "");

    // If it's a 10-digit number, format as (XXX) XXX-XXXX
    if (digits.length === 10) {
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
        6
      )}`;
    }

    // If it already has country code, format accordingly
    if (digits.length === 11 && digits.startsWith("1")) {
      const withoutCountryCode = digits.slice(1);
      return `+1 (${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(
        3,
        6
      )}-${withoutCountryCode.slice(6)}`;
    }

    // Return as is if it doesn't match expected formats
    return phone;
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer ${getTypeColor(
        request.type
      )}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-white/80 p-3 rounded-xl shadow-sm">
            <span className="text-2xl">{getTypeIcon(request.type)}</span>
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {request.type} Request
              </h3>
              <span
                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                  request.status
                )}`}
              >
                {request.status}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <span className="mr-1">📞</span>
                {formatPhoneNumber(request.phone)}
              </span>
              <span className="flex items-center">
                <span className="mr-1">🕒</span>
                {formatDate(request.createdAt)}
              </span>
              <span className="flex items-center">
                <span className="mr-1">🆔</span>
                {request.id}
              </span>
            </div>
            {/* Delivery/Pickup Information - Only for refill requests */}
            {request.type === "refill" && request.deliveryType && (
              <div className="mt-2 flex items-center space-x-3">
                <span
                  className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                    request.deliveryType === "delivery"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-orange-100 text-orange-800 border-orange-300"
                  }`}
                >
                  {request.deliveryType === "delivery" ? "Delivery" : "Pickup"}
                </span>
                {request.estimatedTime && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                    ⏰ {request.estimatedTime}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Click to view details</p>
          </div>
          <div className="bg-white/80 p-2 rounded-xl shadow-sm">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
