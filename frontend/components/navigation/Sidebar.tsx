"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaPills } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { TiFlowMerge } from "react-icons/ti";
import { TbPackage } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { CiBookmarkCheck } from "react-icons/ci";
import { IoMdDoneAll } from "react-icons/io";
import Logo from "../hero/Logo";

interface SidebarProps {
  onSignOut?: () => void;
}

export default function Sidebar({ onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [isNIHBCollapsed, setIsNIHBCollapsed] = useState(false);

  const isNIHBPage = pathname?.includes("/nihb");
  const isWebOrdersPage = pathname?.startsWith("/admin/web-orders");
  const isSettingsPage = pathname?.startsWith("/admin/settings");
  const [isWebOrdersCollapsed, setIsWebOrdersCollapsed] = useState(false);

  // Auto-collapse when not on NIHB; expand when on NIHB
  useEffect(() => {
    if (isNIHBPage) {
      setIsNIHBCollapsed(false);
    } else {
      setIsNIHBCollapsed(true);
    }
  }, [isNIHBPage]);

  // Auto-collapse when not on Web Orders; expand when on Web Orders
  useEffect(() => {
    if (isWebOrdersPage) {
      setIsWebOrdersCollapsed(false);
    } else {
      setIsWebOrdersCollapsed(true);
    }
  }, [isWebOrdersPage]);

  const menuItems = [
    {
      title: "Web Orders",
      children: [
        {
          title: "Requests",
          path: "/admin/web-orders/requests",
          icon: CiBookmarkCheck,
          active: pathname?.startsWith("/admin/web-orders/requests") || pathname === "/admin/web-orders",
        },
        {
          title: "Completed",
          path: "/admin/web-orders/completed-requests",
          icon: IoMdDoneAll,
          active: pathname?.startsWith("/admin/web-orders/completed-requests"),
        },
      ],
    },
    {
      title: "NIHB",
      children: [
        {
          title: "Medication",
          path: "/admin/nihb/medications",
          icon: FaPills,
          active: pathname?.startsWith("/admin/nihb/medications"),
        },
        {
          title: "Appeals",
          path: "/admin/nihb/appeals",
          icon: IoDocumentText,
          active: pathname?.startsWith("/admin/nihb/appeals"),
        },
        {
          title: "Manual Claims",
          path: "/admin/nihb/manual-claims",
          icon: TiFlowMerge,
          active: pathname?.startsWith("/admin/nihb/manual-claims"),
        },
        {
          title: "Diapers & Pads",
          path: "/admin/nihb/diapers-pads",
          icon: TbPackage,
          active: pathname?.startsWith("/admin/nihb/diapers-pads"),
        },
      ],
    },
  ];

  return (
    <div className="h-screen w-64 bg-[#F1FAFD] shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item, index) => (
          <div key={index} className="px-4">
            <div>
              {/* Parent item */}
              <button
                onClick={() => {
                  if (item.title === "NIHB") {
                    setIsNIHBCollapsed(!isNIHBCollapsed);
                  } else if (item.title === "Web Orders") {
                    setIsWebOrdersCollapsed(!isWebOrdersCollapsed);
                  }
                }}
                className={`flex items-center justify-between py-4 px-4 rounded-lg mb-2 w-full transition-all ${
                  (item.title === "NIHB" && isNIHBPage) || (item.title === "Web Orders" && isWebOrdersPage)
                    ? "bg-[#0A438C] text-white"
                    : "bg-transparent text-[#0A438C]"
                }`}
              >
                <span className="text-md font-semibold">{item.title}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    (item.title === "NIHB" && isNIHBCollapsed) || (item.title === "Web Orders" && isWebOrdersCollapsed) ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>

              {/* Children items with vertical indicator */}
              {((item.title === "NIHB" && !isNIHBCollapsed) || (item.title === "Web Orders" && !isWebOrdersCollapsed)) && (
                <div className="pl-4">
                  {item.children.map((child, childIndex) => (
                    <Link key={childIndex} href={child.path as any}>
                      <div
                        className={`flex items-center space-x-2 py-3.5 px-4 rounded-lg mb-2 transition-colors relative ${
                          child.active
                            ? "bg-[#EBF2FF] text-[#3A79C9]"
                            : "text-[#6E6C70] hover:bg-gray-100 hover:text-[#888888]"
                        }`}
                      >
                        {/* Vertical line indicator - blue and thick for active, gray and thin for inactive */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 ${
                            child.active
                              ? "w-1 bg-[#3A79C9]"
                              : "w-0.5 bg-gray-300"
                          }`}
                        ></div>
                        {typeof child.icon === "string" ? (
                          <span className="text-2xl">{child.icon}</span>
                        ) : (
                          <child.icon className="w-6 h-6" />
                        )}
                        <span
                          className={`text-base ${
                            child.active ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {child.title}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </nav>
      <div className="w-[90%] mx-auto">
        {/* Deleted Claims Link */}
        <div className="border-t border-gray-200 py-2">
          <Link href="/admin/deleted-claims">
            <div
              className={`flex items-center space-x-3 py-3.5 px-4 rounded-lg transition-colors ${
                pathname?.includes("/admin/deleted-claims")
                  ? "bg-[#0A438C] text-white"
                  : "text-[#6E6C70] hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span
                className={`text-base ${
                  pathname?.includes("/admin/deleted-claims")
                    ? "font-semibold"
                    : "font-medium"
                }`}
              >
                Deleted Claims
              </span>
            </div>
          </Link>
        </div>

        {/* Settings Link */}
        <div className="border-t border-gray-200 py-2">
          <Link href="/admin/settings">
            <div
              className={`flex items-center space-x-3 py-3.5 px-4 rounded-lg transition-colors ${
                isSettingsPage
                  ? "bg-[#0A438C] text-white"
                  : "text-[#6E6C70] hover:bg-gray-100"
              }`}
            >
              <IoSettingsOutline className="w-6 h-6" />
              <span
                className={`text-base ${
                  isSettingsPage ? "font-semibold" : "font-medium"
                }`}
              >
                Settings
              </span>
            </div>
          </Link>
        </div>
        {/* Sign Out */}
        <div className="border-t pt-4 border-gray-200 px-4 pb-4">
          <button
            onClick={onSignOut}
            className="flex items-center space-x-3 w-full text-[#DC3545] hover:text-red-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path
                fill="white"
                d="M9 11l3-3m0 0l3 3m-3-3v8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <span className="text-base font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
