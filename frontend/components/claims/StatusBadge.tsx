"use client";

import { useState } from "react";

interface StatusBadgeProps {
  status:
    | "new"
    | "case-number-open"
    | "authorized"
    | "denied"
    | "letter-sent-to-doctor"
    | "letters-received"
    | "letters-sent-to-nihb"
    | "form-filled"
    | "form-sent-to-doctor"
    | "sent-to-nihb"
    | "sent"
    | "payment-received";
  size?: "sm" | "md" | "lg";
  onChange?: (
    newStatus:
      | "new"
      | "case-number-open"
      | "authorized"
      | "denied"
      | "letter-sent-to-doctor"
      | "letters-received"
      | "letters-sent-to-nihb"
      | "form-filled"
      | "form-sent-to-doctor"
      | "sent-to-nihb"
      | "sent"
      | "payment-received"
  ) => void;
  category?: string;
}

export default function StatusBadge({
  status,
  size = "md",
  onChange,
  category,
}: StatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const menuRef = useState<HTMLDivElement | null>(null)[0];

  const getStatusConfig = (statusValue: string) => {
    switch (statusValue) {
      case "new":
        return {
          label: "New",
          dotColor: "bg-[#E97726]",
          badgeClass: "bg-[#FFF3E0] text-[#E97726] border-[#E97726]",
        };
      case "case-number-open":
        return {
          label: "Case Number Open",
          dotColor: "bg-[#0A438C]",
          badgeClass: "bg-[#E0F2F7] text-[#0A438C] border-[#0A438C]",
        };
      case "letter-sent-to-doctor":
        return {
          label: "Letter Sent to Doctor",
          dotColor: "bg-[#0A438C]",
          badgeClass: "bg-[#E0F2F7] text-[#0A438C] border-[#0A438C]",
        };
      case "letters-received":
        return {
          label: "Letters Received",
          dotColor: "bg-purple-600",
          badgeClass: "bg-purple-50 text-purple-600 border-purple-600",
        };
      case "letters-sent-to-nihb":
        return {
          label: "Letters Sent to NIHB",
          dotColor: "bg-indigo-600",
          badgeClass: "bg-indigo-50 text-indigo-600 border-indigo-600",
        };
      case "authorized":
        return {
          label: "Authorized",
          dotColor: "bg-[#007E2C]",
          badgeClass: "bg-[#E6F7ED] text-[#007E2C] border-[#007E2C]",
        };
      case "denied":
        return {
          label: "Denied",
          dotColor: "bg-red-600",
          badgeClass: "bg-red-50 text-red-600 border-red-600",
        };
      case "form-filled":
        return {
          label: "Form Filled",
          dotColor: "bg-blue-600",
          badgeClass: "bg-blue-50 text-blue-600 border-blue-600",
        };
      case "form-sent-to-doctor":
        return {
          label: "Form Sent to Doctor",
          dotColor: "bg-[#0A438C]",
          badgeClass: "bg-[#E0F2F7] text-[#0A438C] border-[#0A438C]",
        };
      case "sent-to-nihb":
        return {
          label: "Sent to NIHB",
          dotColor: "bg-indigo-600",
          badgeClass: "bg-indigo-50 text-indigo-600 border-indigo-600",
        };
      case "sent":
        return {
          label: "Sent",
          dotColor: "bg-blue-600",
          badgeClass: "bg-blue-50 text-blue-600 border-blue-600",
        };
      case "payment-received":
        return {
          label: "Payment Received",
          dotColor: "bg-green-600",
          badgeClass: "bg-green-50 text-green-600 border-green-600",
        };
      default:
        return {
          label: statusValue,
          dotColor: "bg-gray-500",
          badgeClass: "bg-gray-100 text-gray-800 border-gray-300",
        };
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "px-2 py-0.5 text-xs";
      case "md":
        return "px-3 py-1 text-sm";
      case "lg":
        return "px-4 py-1.5 text-base";
      default:
        return "px-3 py-1 text-sm";
    }
  };

  const { label, dotColor, badgeClass } = getStatusConfig(status);

  const getOptionsForCategory = () => {
    if (category === "appeals") {
      return [
        { value: "new", label: "New", dotColor: "bg-[#E97726]" },
        {
          value: "letter-sent-to-doctor",
          label: "Letter Sent to Doctor",
          dotColor: "bg-[#0A438C]",
        },
        {
          value: "letters-received",
          label: "Letters Received",
          dotColor: "bg-purple-600",
        },
        {
          value: "letters-sent-to-nihb",
          label: "Letters Sent to NIHB",
          dotColor: "bg-indigo-600",
        },
        { value: "authorized", label: "Authorized", dotColor: "bg-[#007E2C]" },
        { value: "denied", label: "Denied", dotColor: "bg-red-600" },
      ];
    } else if (category === "diapers-pads") {
      return [
        { value: "new", label: "New", dotColor: "bg-[#E97726]" },
        { value: "form-filled", label: "Form Filled", dotColor: "bg-blue-600" },
        {
          value: "form-sent-to-doctor",
          label: "Form Sent to Doctor",
          dotColor: "bg-[#0A438C]",
        },
        {
          value: "sent-to-nihb",
          label: "Sent to NIHB",
          dotColor: "bg-indigo-600",
        },
        { value: "authorized", label: "Authorized", dotColor: "bg-[#007E2C]" },
        { value: "denied", label: "Denied", dotColor: "bg-red-600" },
      ];
    } else if (category === "manual-claims") {
      return [
        { value: "new", label: "New", dotColor: "bg-[#E97726]" },
        { value: "sent", label: "Sent", dotColor: "bg-blue-600" },
        { value: "payment-received", label: "Payment Received", dotColor: "bg-green-600" },
      ];
    } else {
      // Medications and other categories
      return [
        { value: "new", label: "New", dotColor: "bg-[#E97726]" },
        {
          value: "case-number-open",
          label: "Case Number Open",
          dotColor: "bg-[#0A438C]",
        },
        { value: "authorized", label: "Authorized", dotColor: "bg-[#007E2C]" },
        { value: "denied", label: "Denied", dotColor: "bg-red-600" },
      ];
    }
  };

  const options = getOptionsForCategory();

  const handleSelect = (
    newStatus:
      | "new"
      | "case-number-open"
      | "authorized"
      | "denied"
      | "letter-sent-to-doctor"
      | "letters-received"
      | "letters-sent-to-nihb"
      | "form-filled"
      | "form-sent-to-doctor"
      | "sent-to-nihb"
      | "sent"
      | "payment-received"
  ) => {
    onChange?.(newStatus);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = (
              e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;
            const menuHeight = category === "appeals" ? 260 : 170; // Appeals has 6 options, others have 4

            // If not enough space below but more space above, show above
            const showAbove =
              spaceBelow < menuHeight && spaceAbove > spaceBelow;

            setMenuPosition({
              x: rect.left,
              y: showAbove ? rect.top - menuHeight + 6 : rect.bottom + 4,
            });
            setIsOpen(!isOpen);
          }}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full cursor-pointer transition-all hover:opacity-80 ${badgeClass} ${getSizeClass()}`}
        >
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          {label}
          <svg
            className="w-3 h-3 ml-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Fixed dropdown outside container overflow */}
      {isOpen && menuPosition && (
        <>
          <div
            className="fixed w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            {options.map((option) => {
              const config = getStatusConfig(option.value);
              return (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option.value as any);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${option.dotColor}`} />
                  <span className="text-xs text-gray-900">
                    Mark as {config.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => {
              setIsOpen(false);
              setMenuPosition(null);
            }}
          />
        </>
      )}
    </>
  );
}
