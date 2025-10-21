"use client";

import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface AdminHeaderProps {
  isLoggingOut: boolean;
  onLogout: () => void;
  onRefresh: () => void;
}

export default function AdminHeader({ isLoggingOut, onLogout, onRefresh }: AdminHeaderProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="bg-gradient-to-r from-[#0A438C] to-[#0A7BB2] p-3 rounded-xl shadow-lg">
              <span className="text-white text-2xl">🏥</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Manage pharmacy requests and consultations
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={onRefresh}
              className="bg-white text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 shadow-sm"
            >
              Refresh
            </button>
            <button
              onClick={onLogout}
              disabled={isLoggingOut}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              {isLoggingOut ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  Logging out...
                </>
              ) : (
                <>
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
