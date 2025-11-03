"use client";

import { usePathname } from "next/navigation";
import { MdArrowRight } from "react-icons/md";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  const pathname = usePathname();

  // For NIHB pages (supports both /nihb and /admin/nihb), show formatted breadcrumbs
  if (pathname && pathname.includes("/nihb")) {
    const parts = pathname.split("/").filter(Boolean);
    const nihbIndex = parts.findIndex((p) => p === "nihb");
    const isAddPage = parts[parts.length - 1] === "add";
    const category = isAddPage ? parts[parts.length - 2] : parts[nihbIndex + 1];
    const categoryMap: Record<string, string> = {
      medications: "MEDICATIONS",
      appeals: "APPEALS",
      "manual-claims": "MANUAL CLAIMS",
      "diapers-pads": "DIAPERS & PADS",
    };
    const displayCategory = categoryMap[category] || category.toUpperCase();

    return (
      <div className="bg-white pl-4 pr-6 py-4">
        <div className="flex items-center">
          <MdArrowRight className="w-8 h-8 text-[#0A438C]" />
          <span className="text-sm font-medium ml-2">
            <span className="text-[#0A438C]">NIHB</span>
            <span className="text-[#888888]"> / </span>
            <span className="text-[#888888]">{displayCategory}</span>
            {isAddPage && (
              <>
                <span className="text-[#888888]"> / </span>
                <span className="text-[#888888]">ADD CLAIMS</span>
              </>
            )}
          </span>
        </div>
      </div>
    );
  }

  // For Web Orders pages (supports both /web-orders and /admin/web-orders), match NIHB header style
  if (pathname && pathname.includes('/web-orders')) {
    return (
      <div className="bg-white pl-4 pr-6 py-4">
        <div className="flex items-center">
          <MdArrowRight className="w-8 h-8 text-[#0A438C]" />
          <span className="text-sm font-medium ml-2">
            <span className="text-[#0A438C]">WEB ORDERS</span>
          </span>
        </div>
      </div>
    );
  }

  // For Deleted Claims pages, match NIHB header style
  if (pathname && pathname.includes('/deleted-claims')) {
    return (
      <div className="bg-white pl-4 pr-6 py-4">
        <div className="flex items-center">
          <MdArrowRight className="w-8 h-8 text-[#0A438C]" />
          <span className="text-sm font-medium ml-2">
            <span className="text-[#0A438C]">DELETED CLAIMS</span>
          </span>
        </div>
      </div>
    );
  }

  // For other pages, show title
  return (
    <div className="bg-white pl-4 pr-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-[#6E6C70]">{title}</h1>
        {description && (
          <p className="text-sm text-[#888888] mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
