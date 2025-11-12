"use client";
import { NavigationItem } from "@/lib/data/heroData";
import { useState, useEffect } from "react";
import Logo from "./Logo";

interface NavigationProps {
  items: NavigationItem[];
  isModalOpen?: boolean;
  setIsModalOpen?: (open: boolean) => void;
}

export default function Navigation({
  items,
  isModalOpen = false,
  setIsModalOpen,
}: NavigationProps) {
  const [activeSection, setActiveSection] = useState("#home");
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // Set current path
    setCurrentPath(window.location.pathname);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // Offset for sticky nav height
      let currentSection = "#home";

      items.forEach((item) => {
        const element = document.querySelector(item.href);
        if (!element) return;

        const elementTop = element instanceof HTMLElement ? element.offsetTop : 0;

        if (elementTop <= scrollPosition) {
          currentSection = item.href;
        }
      });

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={`hidden md:flex items-center w-full px-12 py-[14px] bg-[#00215C]/90 transition-opacity duration-300 ${
          isModalOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Logo - Left */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Navigation Links - Center */}
        <div className="flex-1 flex items-center justify-center gap-4">
          {items.map((item, index) => {
            // Determine if this link should be active
            let isActive = false;
            if (currentPath === "/services" && item.href === "#services") {
              isActive = true; // Services link is active on services page
            } else if (currentPath === "/" && activeSection === item.href) {
              isActive = true; // Normal scroll-based active state on main page
            }

            const base =
              "transition-colors duration-200 px-3 py-2 text-white font-medium hover:text-white/80";
            const activeClass = isActive
              ? "text-white font-semibold"
              : "text-white/40";

            // Handle navigation - if on services page and not services link, go to main page
            const handleClick = (e: React.MouseEvent) => {
              setActiveSection(item.href);

              if (currentPath === "/services" && item.href !== "#services") {
                e.preventDefault();
                window.location.href = `/${item.href}`;
              }
            };

            return (
              <a
                key={index}
                href={item.href}
                onClick={handleClick}
                className={`${base} ${activeClass}`}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Request A Refill Button - Right */}
        <div className="flex-shrink-0">
          <button
            onClick={() => setIsModalOpen?.(true)}
            className="bg-white text-[#0A438C] px-6 py-2 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors border border-[#0A438C]"
          >
            Request A Refill
          </button>
        </div>
      </nav>
    </>
  );
}
