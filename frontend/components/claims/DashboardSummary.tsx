"use client";

import { motion } from "framer-motion";

interface DashboardSummaryProps {
  total: number;
  new: number;
  caseNumberOpen: number;
  completed: number;
  denied: number;
  category: string;
  onAddClaim: () => void;
}

export default function DashboardSummary({
  total,
  new: newCount,
  caseNumberOpen,
  completed,
  denied,
  category,
  onAddClaim,
}: DashboardSummaryProps) {
  const stats = [
    { label: "Total Claims", value: total },
    { label: "New Claims", value: newCount },
    { label: "Case Number Open", value: caseNumberOpen },
    { label: "Denied", value: denied },
    { label: "Completed", value: completed },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-[#F1FAFD] border-[.5px] border-[#85CEE8] rounded-lg p-4"
        >
          <div className="text-sm font-medium text-[#888292] mb-4">
            {stat.label}
          </div>
          <div className="text-4xl font-bold text-[#0A438C]">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
