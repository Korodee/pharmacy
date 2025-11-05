"use client";

import { useState } from "react";
import Dropdown from "../ui/Dropdown";

interface ClaimFiltersProps {
  title: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  dateMode: 'none' | 'prescription' | 'expiry';
  onDateModeChange: (value: 'none' | 'prescription' | 'expiry') => void;
  dateStart: string;
  onDateStartChange: (value: string) => void;
  dateEnd: string;
  onDateEndChange: (value: string) => void;
  category?: string;
}

export default function ClaimFilters({
  title,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateMode,
  onDateModeChange,
  dateStart,
  onDateStartChange,
  dateEnd,
  onDateEndChange,
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
        { value: "received-form-from-doctor", label: "Received Form from Doctor" },
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

  const dateModeOptions = [
    { value: 'none', label: 'No Date Filter' },
    { value: 'prescription', label: 'Date of Prescription' },
    { value: 'expiry', label: 'Expiry Date' },
  ];

  const mask = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0,4)}-${digits.slice(4)}`;
    return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6)}`;
  };

  // Lightweight calendar for start/end selectors
  const [openCalendar, setOpenCalendar] = useState<null | 'start' | 'end'>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigateMonth = (dir: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + (dir === 'prev' ? -1 : 1));
      return d;
    });
  };
  const daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const out: Array<{ date: Date; current: boolean }> = [];
    const cursor = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      out.push({ date: new Date(cursor), current: cursor.getMonth() === month });
      cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  };
  const toISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const da = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${da}`;
  };

  return (
    <div className="p-1">
      <div className="flex items-center gap-4">
        <h2 className="text-md font-[400] text-[#888292]">{title}</h2>
        <div className="flex-1"></div>
        <span className="text-sm font-normal text-[#888888]">Filter By:</span>

        {/* Search (hidden when date filter is active) */}
        {dateMode === 'none' && (
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
        )}

        {/* Status Filter */}
        <Dropdown
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusChange}
          placeholder="Status"
          className="w-48"
        />

        {/* Date Filter Mode */}
        <Dropdown
          options={dateModeOptions}
          value={dateMode}
          onChange={(v) => onDateModeChange(v as any)}
          placeholder="Date Filter"
          className="w-56"
        />

        {/* Range Inputs */}
        {dateMode !== 'none' && (
          <div className="flex items-center gap-1 relative">
            <input
              type="text"
              placeholder="Start yyyy-mm-dd"
              value={dateStart}
              onChange={(e) => onDateStartChange(mask(e.target.value))}
              inputMode="numeric"
              pattern="\\d{4}-\\d{2}-\\d{2}"
              className="w-40 px-3 py-2 border border-[#F1F0F2] focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none text-sm bg-white placeholder:text-[#A5A5A5] text-gray-900"
              style={{ borderRadius: '8px' }}
            />
            <button
              type="button"
              onClick={() => setOpenCalendar(openCalendar === 'start' ? null : 'start')}
              className="p-2 -ml-1 text-gray-500 hover:text-gray-700"
              aria-label="Open start date calendar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </button>
            {openCalendar === 'start' && (
              <div className="absolute z-50 top-12 left-0 bg-white border border-gray-200 rounded-lg shadow p-3 w-64">
                <div className="flex items-center justify-between mb-2">
                  <button className="p-1 text-gray-600 hover:text-gray-900" onClick={() => navigateMonth('prev')} aria-label="Previous month">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <div className="text-sm font-medium text-gray-700">{currentMonth.toLocaleString('default',{month:'long'})} {currentMonth.getFullYear()}</div>
                  <button className="p-1 text-gray-600 hover:text-gray-900" onClick={() => navigateMonth('next')} aria-label="Next month">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-1">
                  {daysOfWeek.map((d) => (<div key={d} className="text-center p-1">{d}</div>))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((cell, idx) => (
                    <button
                      key={idx}
                      className={`p-2 text-xs rounded ${cell.current ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-400'}`}
                      onClick={() => { onDateStartChange(toISO(cell.date)); setOpenCalendar(null); }}
                      type="button"
                    >
                      {cell.date.getDate()}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <span className="text-sm text-[#888888]">to</span>
            <input
              type="text"
              placeholder="End yyyy-mm-dd"
              value={dateEnd}
              onChange={(e) => onDateEndChange(mask(e.target.value))}
              inputMode="numeric"
              pattern="\\d{4}-\\d{2}-\\d{2}"
              className="w-40 px-3 py-2 border border-[#F1F0F2] focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none text-sm bg-white placeholder:text-[#A5A5A5] text-gray-900"
              style={{ borderRadius: '8px' }}
            />
            <button
              type="button"
              onClick={() => setOpenCalendar(openCalendar === 'end' ? null : 'end')}
              className="p-2 -ml-1 text-gray-500 hover:text-gray-700"
              aria-label="Open end date calendar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </button>
            {openCalendar === 'end' && (
              <div className="absolute z-50 top-12 right-0 bg-white border border-gray-200 rounded-lg shadow p-3 w-64">
                <div className="flex items-center justify-between mb-2">
                  <button className="p-1 text-gray-600 hover:text-gray-900" onClick={() => navigateMonth('prev')} aria-label="Previous month">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <div className="text-sm font-medium text-gray-700">{currentMonth.toLocaleString('default',{month:'long'})} {currentMonth.getFullYear()}</div>
                  <button className="p-1 text-gray-600 hover:text-gray-900" onClick={() => navigateMonth('next')} aria-label="Next month">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-1">
                  {daysOfWeek.map((d) => (<div key={d} className="text-center p-1">{d}</div>))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((cell, idx) => (
                    <button
                      key={idx}
                      className={`p-2 text-xs rounded ${cell.current ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-400'}`}
                      onClick={() => { onDateEndChange(toISO(cell.date)); setOpenCalendar(null); }}
                      type="button"
                    >
                      {cell.date.getDate()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
