"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AppealPatientLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppealPatientLetterModal({
  isOpen,
  onClose,
}: AppealPatientLetterModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    date: "",
    appealFor: "",
    dob: "",
    clientId: "",
    medications: "",
    medicationName: "",
    din: "",
    nameAndSignature: "",
  });

  // lightweight calendar state
  const [openCalendar, setOpenCalendar] = useState<null | "date" | "dob">(null);
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

  const maskDate = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 4) return d;
    if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4, 6)}`;
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
  };

  const update = (key: keyof typeof form, value: string) => {
    setForm((p) => ({
      ...p,
      [key]: key === "date" || key === "dob" ? maskDate(value) : value,
    }));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const features = "toolbar=no,location=no,menubar=no,width=900,height=1000";
    const win = window.open("", "_blank", features);
    if (!win) return;
    const html = `<!DOCTYPE html><html><head><title>Patient's Appeal Letter</title>
      <style>
        @page { size: A4; margin: 22mm; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body{font-family: Georgia, 'Times New Roman', serif; color:#111827; line-height:1.7;}
        .container{max-width:800px;margin:0 auto;}
        .letter{font-size:15px}
        .letter-heading{font-size:20px;font-weight:700;text-align:center;margin:0 0 12px}
        .letter-date{text-align:left}
        .title{font-size:22px;font-weight:700;margin:0 0 16px}
        .label{font-weight:700}
        .box{min-height:0;border:1px solid #E5E7EB;border-radius:10px;padding:8px;margin-top:8px;background:#ffffff}
        .section{margin:18px 0}
        .address{margin:10px 0 6px}
        .divider{height:1px;background:#E5E7EB;margin:14px 0}
        .prewrap{white-space:pre-wrap}
        /* Tailwind-like spacing utilities used in preview */
        .space-y-1 > * + * { margin-top: 0.25rem; }
        .mt-6 { margin-top: 1.5rem; }
        .pt-12 { padding-top: 3rem; }
        .pt-2 { padding-top: 0.5rem; }
        .pt-1 { padding-top: 0.25rem; }
        .underline { text-decoration: underline; }
        .underline-offset-4 { text-underline-offset: 4px; }
      </style>
    </head><body><div class="container">${printRef.current.innerHTML}</div></body></html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Appeal Letter to Patient
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
                  ["date", "Date (yyyy-mm-dd)"],
                  ["appealFor", "Appeal For"],
                  ["dob", "DOB (yyyy-mm-dd)"],
                  ["clientId", "Client ID"],
                  ["medications", "Medication(s)"],
                  ["medicationName", "Name of medication"],
                  ["din", "DIN"],
                  ["nameAndSignature", "Name and signature"],
                ] as Array<[keyof typeof form, string]>
              ).map(([k, label]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  {k === "date" || k === "dob" ? (
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
                        onClick={() =>
                          setOpenCalendar(
                            openCalendar === k ? null : (k as "date" | "dob")
                          )
                        }
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
                      {openCalendar === k && (
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
                                  setOpenCalendar(null);
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
            </div>

            {/* Print preview */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <div ref={printRef}>
                <div className="letter text-[15px] leading-7 text-gray-900 space-y-6">
                  <div className="letter-heading">Patient's Appeal Letter</div>
                  {/* Date (right-aligned) */}
                  <div className="letter-date font-medium">{form.date}</div>

                  {/* Recipient address */}
                  <div className="letter-address space-y-1">
                    <div className="font-medium">Drug Exception Centre</div>
                    <div>First Nations & Inuit Health Branch Health Canada</div>
                    <div>1902D, Jeanne Mance Building</div>
                    <div>200 Eglantine Driveway, Tunney’s Pasture</div>
                    <div>Ottawa, Ontario</div>
                    <div>K1A 0K9</div>
                  </div>

                  {/* Meta */}
                  <div className="letter-meta space-y-1 mt-6">
                    <div className="font-semibold underline underline-offset-4">
                      <span className="label">RE: Appeal For</span>{" "}
                      <span className="font-normal">{form.appealFor}</span>
                    </div>
                    <div>
                      <span className="label">DOB:</span> {form.dob}
                    </div>
                    <div>
                      <span className="label">Client ID:</span> {form.clientId}
                    </div>
                    <div>
                      <span className="label">Medication(s):</span>{" "}
                      {form.medications}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="letter-salutation mt-6">
                    To whom it may concern:
                  </div>
                  <div className="box bg-white shadow-sm">
                    <div className="prewrap whitespace-pre-wrap">Please be advised that I am requesting an appeal with respect to the prescription of <i>{form.medicationName}</i>.</div>
                    <div className="mt-2">
                      <span className="label">DIN:</span> {form.din}
                    </div>
                  </div>

                  {/* Closing */}
                  <div className="letter-closing mt-6">
                    Trusting to receive a favorable response, I remain,
                  </div>
                  <div className="mt-2">Yours truly,</div>
                  <div className="pt-12">
                    <div
                      style={{ borderTop: "1px solid #D1D5DB", width: "280px" }}
                    ></div>
                    <div className="pt-2 font-medium">
                      {form.nameAndSignature}
                    </div>
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
