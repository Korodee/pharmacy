"use client";

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
  const stats = [
    { label: "Total", value: totalRequests },
    { label: "Pending", value: pendingRequests },
    { label: "In Progress", value: inProgressRequests },
    { label: "Completed", value: completedRequests },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#F1FAFD] border-[.5px] border-[#85CEE8] rounded-lg p-4 hover:bg-[#E1F4F9] hover:border-[#0A438C] transition-all duration-200"
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
