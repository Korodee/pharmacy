"use client";

import Dropdown from "../ui/Dropdown";

interface ClaimFiltersProps {
  title: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  prescriberFilter: string;
  onPrescriberChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
  productFilter: string;
  onProductChange: (value: string) => void;
}

export default function ClaimFilters({
  title,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
}: ClaimFiltersProps) {
  const statusOptions = [
    { value: "all", label: "Status" },
    { value: "new", label: "New" },
    { value: "case-number-open", label: "Case Number Open" },
    { value: "authorized", label: "Authorized" },
    { value: "denied", label: "Denied" },
  ];

  const dateOptions = [
    { value: "all", label: "Date" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];

  return (
    <div className="p-1">
      <div className="flex items-center gap-4">
        <h2 className="text-md font-[400] text-[#888292]">{title}</h2>
        <div className="flex-1"></div>
        <span className="text-sm font-normal text-[#888888]">Filter By:</span>

        {/* Search */}
        <div className="flex-[1.8] relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#888888]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search Rx Number, Prescriber, Product etc"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#F1F0F2] focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none text-sm bg-white placeholder:text-[#A5A5A5] text-gray-900"
            style={{ borderRadius: "36px" }}
          />
        </div>

        {/* Status Filter */}
        <Dropdown
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusChange}
          placeholder="Status"
          className="w-48"
        />

        {/* Date Filter */}
        <Dropdown
          options={dateOptions}
          value={dateFilter}
          onChange={onDateChange}
          placeholder="Date"
          className="w-48"
        />
      </div>
    </div>
  );
}
