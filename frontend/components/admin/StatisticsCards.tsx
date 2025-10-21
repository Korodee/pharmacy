"use client";

import { motion } from "framer-motion";

interface StatisticsCardsProps {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
}

export default function StatisticsCards({
  totalRequests,
  pendingRequests,
  inProgressRequests,
  completedRequests,
}: StatisticsCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 mb-6"
    >
      {/* Statistics Cards - Compact */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-md font-medium text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalRequests}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-lg">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-md font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-amber-600">
                  {pendingRequests}
                </p>
              </div>
              <div className="bg-amber-100 p-2 rounded-lg">
                <span className="text-lg">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-md font-medium text-gray-600">
                  In Progress
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {inProgressRequests}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-lg">🔄</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-md font-medium text-gray-600">
                  Completed
                </p>
                <p className="text-xl font-bold text-emerald-600">
                  {completedRequests}
                </p>
              </div>
              <div className="bg-emerald-100 p-2 rounded-lg">
                <span className="text-lg">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
