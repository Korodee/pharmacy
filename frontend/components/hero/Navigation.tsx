"use client";
import { NavigationItem } from '@/lib/data/heroData';
import { useState, useEffect } from 'react';

interface NavigationProps {
  items: NavigationItem[];
  isModalOpen?: boolean;
}

export default function Navigation({ items, isModalOpen = false }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
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
      <nav className={`hidden md:flex items-center justify-center w-full transition-opacity duration-300 ${isModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className={`inline-flex mt-3 items-center gap-4 px-3 py-2 rounded-full border border-white/10 backdrop-blur-md whitespace-nowrap transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#0A438C] border-[#0A438C]' 
            : 'bg-[#00215C1A]'
        }`}>
          {items.map((item, index) => {
            const isActive = activeSection === item.href;
            const base = 'transition-colors duration-200 px-4 py-1 rounded-full';
            const color = isScrolled 
              ? (isActive ? 'text-white font-medium' : 'font-light text-white/70 hover:text-white')
              : (isActive ? 'text-white font-medium' : 'font-light text-white/70 hover:text-white');
            return (
              <a key={index} href={item.href} className={`${base} ${color}`}>
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
