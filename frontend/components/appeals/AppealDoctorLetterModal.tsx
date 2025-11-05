"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AppealDoctorLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrinted?: () => void;
}

export default function AppealDoctorLetterModal({
  isOpen,
  onClose,
  onPrinted,
}: AppealDoctorLetterModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    patient: "",
    dob: "",
    medicationName: "",
    prescribingDoctor: "",
    bandId: "",
    din: "",
    condition: "",
    diagnosis: "",
    tests: "",
    justification: "",
  });

  const maskDate = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 4) return d;
    if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4, 6)}`;
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
  };

  const update = (key: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [key]: key === "dob" ? maskDate(value) : value }));
  };

  // Auto-resize helper for narrative textareas
  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // Calendar popover for DOB
  const [openCalendar, setOpenCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigateMonth = (dir: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + (dir === "prev" ? -1 : 1));
      return d;
    });
  };
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const out: Array<{ date: Date; current: boolean }> = [];
    const cursor = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      out.push({
        date: new Date(cursor),
        current: cursor.getMonth() === month,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  };
  const toISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open(
      "",
      "_blank",
      "toolbar=no,location=no,menubar=no,width=900,height=1100"
    );
    if (!win) return;
    const html = `<!DOCTYPE html><html><head><title>Appeal Process (Doctor)</title>
      <style>
        @page { size: A4; margin: 20mm; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body{font-family: Georgia, 'Times New Roman', serif; color:#111827; line-height:1.7}
        .container{max-width:800px;margin:0 auto;}
        .title{font-size:22px;font-weight:700;text-align:center;margin:0 0 16px}
        .col{flex:1}
        .label{font-weight:700}
        .sectionTitle{font-weight:700;text-align:center;margin:18px 0}
        .box{min-height:0;border:1px solid #E5E7EB;border-radius:10px;padding:12px;margin-top:8px;background:#ffffff}
        .handwrite{min-height:60px;height:60px;border:none;background:transparent;padding:0;margin:0}
        /* Tailwind-like utilities used in preview */
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: 1fr 1fr; }
        .gap-4 { gap: 1rem; }
        .space-y-5 > * + * { margin-top: 1.25rem; }
        .text-gray-900 { color: #111827; }
        .prewrap { white-space: pre-wrap; }
        .mt-8 { margin-top: 2rem; }
        .mt-16 { margin-top: 4rem; }
        .pt-8 { padding-top: 2rem; }
        .text-sm { font-size: 0.875rem; }
        .italic { font-style: italic; }
        .font-bold { font-weight: 700; }
      </style>
    </head><body><div class="container">${printRef.current.innerHTML}</div></body></html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    try {
      (win as any).onafterprint = () => {
        try { win.close(); } catch {}
        if (onPrinted) onPrinted();
        onClose(); // close modal and return to add page
      };
    } catch {}
    win.print();
    setTimeout(() => { 
      try { win.close(); } catch {}
      if (onPrinted) onPrinted(); 
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Appeal Process Letter (Doctor)
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-lg bg-[#0A438C] text-white text-sm hover:bg-[#003366]"
              >
                Print / Save PDF
              </button>
              <button
                onClick={onClose}
                className="px-3 text-gray-900 py-2 rounded-lg border text-sm"
              >
                Close
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto"
            style={{ maxHeight: "calc(92vh - 64px)" }}
          >
            {/* Form */}
            <div className="space-y-4">
              {(
                [
                  ["patient", "Patient"],
                  ["dob", "Date of birth (yyyy-mm-dd)"],
                  ["medicationName", "Medication name"],
                  ["prescribingDoctor", "Prescribing doctor"],
                  ["bandId", "Band ID"],
                  ["din", "DIN"],
                ] as Array<[keyof typeof form, string]>
              ).map(([k, label]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  {k === "dob" ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={form[k]}
                        onChange={(e) => update(k, e.target.value)}
                        placeholder={label}
                        inputMode="numeric"
                        pattern="\\d{4}-\\d{2}-\\d{2}"
                        className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none text-sm text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => setOpenCalendar((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                        aria-label="Open calendar"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      {openCalendar && (
                        <div className="absolute z-50 top-11 right-0 bg-white border border-gray-200 rounded-lg shadow p-3 w-64">
                          <div className="flex items-center justify-between mb-2">
                            <button
                              className="p-1 text-gray-600 hover:text-gray-900"
                              onClick={() => navigateMonth("prev")}
                              aria-label="Previous month"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>
                            <div className="text-sm font-medium text-gray-700">
                              {currentMonth.toLocaleString("default", {
                                month: "long",
                              })}{" "}
                              {currentMonth.getFullYear()}
                            </div>
                            <button
                              className="p-1 text-gray-600 hover:text-gray-900"
                              onClick={() => navigateMonth("next")}
                              aria-label="Next month"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-1">
                            {daysOfWeek.map((d) => (
                              <div key={d} className="text-center p-1">
                                {d}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {generateCalendarDays().map((cell, idx) => (
                              <button
                                key={idx}
                                className={`p-2 text-xs rounded ${
                                  cell.current
                                    ? "text-gray-800 hover:bg-gray-100"
                                    : "text-gray-400"
                                }`}
                                onClick={() => {
                                  update(k, toISO(cell.date));
                                  setOpenCalendar(false);
                                }}
                                type="button"
                              >
                                {cell.date.getDate()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={form[k]}
                      onChange={(e) => update(k, e.target.value)}
                      placeholder={label}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none text-sm text-gray-900"
                    />
                  )}
                </div>
              ))}

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                The sections below (Condition, Diagnosis & Prognosis, Test
                Results, and Justification) will be completed by the prescribing
                doctor on the printed form.
              </div>
            </div>

            {/* Print preview */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <div ref={printRef}>
                <div className="text-[15px] leading-7 text-gray-900 space-y-6">
                  <div className="title text-gray-900 text-center">
                    Appeal Process
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col text-gray-900">
                      <span className="label">Patient:</span> {form.patient}
                    </div>
                    <div className="col text-gray-900">
                      <span className="label">Prescribing doctor:</span>{" "}
                      {form.prescribingDoctor}
                    </div>
                    <div className="col text-gray-900">
                      <span className="label">Date of birth:</span> {form.dob}
                    </div>
                    <div className="col text-gray-900">
                      <span className="label">Band ID:</span> {form.bandId}
                    </div>
                    <div className="col text-gray-900">
                      <span className="label">Medication name:</span>{" "}
                      {form.medicationName}
                    </div>
                    <div className="col text-gray-900">
                      <span className="label">DIN:</span> {form.din}
                    </div>
                  </div>

                  <div className="sectionTitle">Patient Diagnosis</div>

                  <div className="space-y-5">
                    <div>
                      <div className="label text-gray-900">Condition:</div>
                      <div className="handwrite min-h-28"></div>
                    </div>
                    <div>
                      <div className="label text-gray-900">
                        Diagnosis & Prognosis (other drugs tried)
                      </div>
                      <div className="handwrite min-h-28"></div>
                    </div>
                    <div>
                      <div className="label text-gray-900">Test Results:</div>
                      <div className="handwrite min-h-28"></div>
                    </div>
                    <div>
                      <div className="label text-gray-900">
                        Justification for the proposed drug & other information
                      </div>
                      <div className="handwrite min-h-28"></div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div>Doctor's signature:</div>
                    <div style={{ marginTop: "32px" }}>
                      _______________________
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-16 pt-8 text-sm italic font-bold text-gray-900">
                    <div>***Please return filled form and appeal answer to Familiprix F.Chamoun & S.Marinis</div>
                    <div>Phone: (450)638-5760, Fax: (450) 635-8249, 10 River road, Kahnawake, J0L 1B0, Qc, Canada</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
