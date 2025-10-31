"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaPills } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { TiFlowMerge } from "react-icons/ti";
import { TbPackage } from "react-icons/tb";
import Logo from "../hero/Logo";

interface SidebarProps {
  onSignOut?: () => void;
}

export default function Sidebar({ onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [isNIHBCollapsed, setIsNIHBCollapsed] = useState(false);

  const isNIHBPage = pathname?.includes("/nihb");
  const isWebOrdersPage = pathname?.startsWith("/admin/web-orders");

  // Auto-collapse when not on NIHB; expand when on NIHB
  useEffect(() => {
    if (isNIHBPage) {
      setIsNIHBCollapsed(false);
    } else {
      setIsNIHBCollapsed(true);
    }
  }, [isNIHBPage]);

  const menuItems = [
    {
      title: "Web Orders",
      path: "/admin/web-orders",
      active: isWebOrdersPage,
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
            {item.children ? (
              <div>
                {/* Parent item */}
                <button
                  onClick={() => setIsNIHBCollapsed(!isNIHBCollapsed)}
                  className={`flex items-center justify-between py-3 px-4 rounded-lg mb-2 w-full transition-all ${
                    isNIHBPage ? "bg-[#0A438C] text-white" : "bg-transparent text-[#0A438C]"
                  }`}
                >
                  <span className="text-sm font-medium">{item.title}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isNIHBCollapsed ? "rotate-180" : ""
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
                {!isNIHBCollapsed && (
                  <div className="pl-4">
                    {item.children.map((child, childIndex) => (
                      <Link key={childIndex} href={child.path as any}>
                        <div
                          className={`flex items-center space-x-3 py-2.5 px-4 rounded-lg mb-1 transition-colors relative ${
                            child.active
                              ? "bg-[#EBF2FF] text-[#3A79C9]"
                              : "text-[#888888] hover:bg-gray-50"
                          }`}
                        >
                          {/* Vertical line indicator - blue and thick for active, gray and thin for inactive */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 ${
                              child.active
                                ? "w-0.5 bg-[#3A79C9]"
                                : "w-px bg-[#888888]"
                            }`}
                          ></div>
                          {typeof child.icon === "string" ? (
                            <span className="text-xl">{child.icon}</span>
                          ) : (
                            <child.icon className="w-5 h-5" />
                          )}
                          <span className="text-sm font-medium">
                            {child.title}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link href={item.path as any}>
                <div
                  className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${
                    item.active
                      ? "bg-[#0A438C] text-white"
                      : "text-[#6E6C70] hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm font-normal">{item.title}</span>
                </div>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={onSignOut}
          className="flex items-center space-x-3 w-full text-[#DC3545] hover:text-red-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path
              fill="white"
              d="M9 11l3-3m0 0l3 3m-3-3v8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
