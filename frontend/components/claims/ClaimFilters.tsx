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
  category?: string;
}

export default function ClaimFilters({
  title,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  category,
}: ClaimFiltersProps) {
  const getStatusOptions = () => {
    if (category === "appeals") {
      return [
        { value: "all", label: "Status" },
        { value: "new", label: "New" },
        { value: "letter-sent-to-doctor", label: "Letter Sent to Doctor" },
        { value: "letters-received", label: "Letters Received" },
        { value: "letters-sent-to-nihb", label: "Letters Sent to NIHB" },
        { value: "authorized", label: "Authorized" },
        { value: "denied", label: "Denied" },
      ];
    } else if (category === "diapers-pads") {
      return [
        { value: "all", label: "Status" },
        { value: "new", label: "New" },
        { value: "form-filled", label: "Form Filled" },
        { value: "form-sent-to-doctor", label: "Form Sent to Doctor" },
        { value: "sent-to-nihb", label: "Sent to NIHB" },
        { value: "authorized", label: "Authorized" },
        { value: "denied", label: "Denied" },
      ];
    } else if (category === "manual-claims") {
      return [
        { value: "all", label: "Status" },
        { value: "new", label: "New" },
        { value: "sent", label: "Sent" },
        { value: "payment-received", label: "Payment Received" },
      ];
    } else {
      return [
        { value: "all", label: "Status" },
        { value: "new", label: "New" },
        { value: "case-number-open", label: "Case Number Open" },
        { value: "authorized", label: "Authorized" },
        { value: "denied", label: "Denied" },
      ];
    }
  };

  const statusOptions = getStatusOptions();

  const dateOptions = [
    { value: "all", label: "Expiry Date" },
    { value: "today", label: "Expiring Today" },
    { value: "week", label: "Expiring This Week" },
    { value: "month", label: "Expiring This Month" },
    { value: "year", label: "Expiring This Year" },
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
          placeholder="Expiry Date"
          className="w-48"
        />
      </div>
    </div>
  );
}
