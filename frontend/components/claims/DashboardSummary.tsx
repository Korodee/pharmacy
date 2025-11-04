"use client";

interface DashboardSummaryProps {
  total: number;
  new: number;
  caseNumberOpen: number;
  completed: number;
  denied: number;
  category: string;
  onAddClaim: () => void;
  onStatusClick?: (status: string) => void;
}

export default function DashboardSummary({
  total,
  new: newCount,
  caseNumberOpen,
  completed,
  denied,
  category,
  onAddClaim,
  onStatusClick,
}: DashboardSummaryProps) {
  const stats =
    category === "appeals"
      ? [
          { label: "Total Claims", value: total, status: null },
          { label: "New Claims", value: newCount, status: "new" },
          { label: "Denied", value: denied, status: "denied" },
          { label: "Completed", value: completed, status: "authorized" },
        ]
      : category === "diapers-pads"
      ? [
          { label: "Total Claims", value: total, status: null },
          { label: "New Claims", value: newCount, status: "new" },
          { label: "Denied", value: denied, status: "denied" },
          { label: "Completed", value: completed, status: "authorized" },
        ]
      : [
          { label: "Total Claims", value: total, status: null },
          { label: "New Claims", value: newCount, status: "new" },
          {
            label: "Case Number Open",
            value: caseNumberOpen,
            status: "case-number-open",
          },
          { label: "Denied", value: denied, status: "denied" },
          { label: "Completed", value: completed, status: "authorized" },
        ];

  const gridCols =
    category === "appeals" || category === "diapers-pads"
      ? "lg:grid-cols-4"
      : "lg:grid-cols-5";

  const handleCardClick = (stat: { label: string; status: string | null }) => {
    if (stat.label === "Total Claims") {
      // Reset filter to show all
      onStatusClick?.("all");
    } else if (stat.status && onStatusClick) {
      // Filter by specific status
      onStatusClick(stat.status);
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-4`}>
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          onClick={() => handleCardClick(stat)}
          className="bg-[#F1FAFD] border-[.5px] border-[#85CEE8] rounded-lg p-4 cursor-pointer hover:bg-[#E1F4F9] hover:border-[#0A438C] transition-all duration-200"
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
