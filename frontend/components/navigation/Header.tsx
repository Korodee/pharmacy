"use client";

import { usePathname } from "next/navigation";

interface HeaderProps {
  onAddClaim?: () => void;
  category?: "medications" | "appeals" | "manual-claims" | "diapers-pads";
}

export default function Header({ onAddClaim, category }: HeaderProps) {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    if (pathname?.startsWith("/web-orders")) {
      return "Web Orders";
    }
    if (pathname?.startsWith("/nihb")) {
      const categoryMap: Record<string, string> = {
        medications: "MEDICATIONS",
        appeals: "APPEALS",
        "manual-claims": "MANUAL CLAIMS",
        "diapers-pads": "DIAPERS & PADS",
      };
      const displayCategory = category
        ? categoryMap[category] || category.toUpperCase()
        : "MEDICATIONS";
      return `NIHB / ${displayCategory}`;
    }
    return "";
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2">
        <span className="text-[#6E6C70] text-sm font-medium">
          {getBreadcrumbs()}
        </span>
      </div>

      {/* Add Claim Button */}
      {onAddClaim && (
        <button
          onClick={onAddClaim}
          className="flex items-center space-x-2 bg-[#0A438C] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition-colors shadow-md"
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="font-medium text-sm">Add Claim</span>
        </button>
      )}
    </div>
  );
}

