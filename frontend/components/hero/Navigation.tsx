"use client";
import { NavigationItem } from '@/lib/data/heroData';
import { useState, useEffect } from 'react';
import Logo from './Logo';

interface NavigationProps {
  items: NavigationItem[];
  isModalOpen?: boolean;
  setIsModalOpen?: (open: boolean) => void;
}

export default function Navigation({ items, isModalOpen = false, setIsModalOpen }: NavigationProps) {
  const [activeSection, setActiveSection] = useState('#home');

  useEffect(() => {
    const handleScroll = () => {
      // Check which section is currently in view
      const sections = items.map(item => item.href);
      let currentSection = '#home';
      
      for (const section of sections) {
        const element = document.querySelector(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = section;
            break;
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden md:flex items-center w-full rounded-b-xl px-12 py-[14px] bg-[#00215C]/90 transition-opacity duration-300 ${isModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Logo - Left */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Navigation Links - Center */}
        <div className="flex-1 flex items-center justify-center gap-4">
          {items.map((item, index) => {
            const isActive = activeSection === item.href;
            const base = 'transition-colors duration-200 px-3 py-2 text-white font-medium hover:text-white/80';
            const activeClass = isActive ? 'text-white font-semibold' : 'text-white/40';
            return (
              <a key={index} href={item.href} className={`${base} ${activeClass}`}>
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
