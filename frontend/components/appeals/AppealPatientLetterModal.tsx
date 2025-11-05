"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AppealPatientLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppealPatientLetterModal({ isOpen, onClose }: AppealPatientLetterModalProps) {
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

  const maskDate = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 4) return d;
    if (d.length <= 6) return `${d.slice(0,4)}-${d.slice(4,6)}`;
    return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6)}`;
  };

  const update = (key: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [key]: key === "date" || key === "dob" ? maskDate(value) : value }));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const features = "toolbar=no,location=no,menubar=no,width=900,height=1000";
    const win = window.open("", "_blank", features);
    if (!win) return;
    const html = `<!DOCTYPE html><html><head><title>Appeal Letter (Patient)</title>
      <style>
        body{font-family: ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial; color:#111827;}
        .container{padding:32px;}
        .muted{color:#6B7280}
        .title{font-size:20px;font-weight:700;margin:24px 0}
        .row{display:flex;justify-content:space-between;margin:6px 0}
        .block{margin:18px 0}
        .label{font-weight:700}
        .box{min-height:60px;border:1px solid #E5E7EB;border-radius:8px;padding:12px;margin-top:6px}
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
            <h2 className="text-xl font-semibold">Appeal Letter to Patient</h2>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="px-4 py-2 rounded-lg bg-[#0A438C] text-white text-sm hover:bg-[#003366]">Print / Save PDF</button>
              <button onClick={onClose} className="px-3 py-2 rounded-lg border text-sm">Close</button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto" style={{ maxHeight: "calc(92vh - 64px)" }}>
            {/* Form */}
            <div className="space-y-4">
              {([
                ["date","Date (yyyy-mm-dd)"],
                ["appealFor","Appeal For"],
                ["dob","DOB (yyyy-mm-dd)"],
                ["clientId","Client ID"],
                ["medications","Medication(s)"],
                ["medicationName","Name of medication"],
                ["din","DIN"],
                ["nameAndSignature","Name and signature"],
              ] as Array<[keyof typeof form, string]>).map(([k,label]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={form[k]}
                    onChange={(e)=>update(k, e.target.value)}
                    placeholder={label}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none text-sm text-gray-900"
                  />
                </div>
              ))}
            </div>

            {/* Print preview */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <div ref={printRef}>
                <div className="text-sm">
                  <div className="block"><span className="label">Date:</span> {form.date}</div>
                  <div className="mt-6">
                    <div>Drug Exception Centre</div>
                    <div>First Nations & Inuit Health Branch Health Canada</div>
                    <div>1902D, Jeanne Mance Building</div>
                    <div>200 Eglantine Driveway, Tunney’s Pasture</div>
                    <div>Ottawa, Ontario</div>
                    <div>K1A 0K9</div>
                  </div>

                  <div className="block mt-8"><span className="label">RE: Appeal For</span> {form.appealFor}</div>
                  <div className="block"><span className="label">DOB:</span> {form.dob}</div>
                  <div className="block"><span className="label">Client ID:</span> {form.clientId}</div>
                  <div className="block"><span className="label">Medication(s):</span> {form.medications}</div>

                  <div className="block mt-8">To whom it may concern:</div>
                  <div className="box">
                    Please be advised that I am requesting an appeal with respect to the prescription of <i>{form.medicationName}</i>.
                    <div className="mt-2"><span className="label">DIN:</span> {form.din}</div>
                  </div>

                  <div className="block mt-16">Trusting to receive a favorable response, I remain,</div>
                  <div className="block mt-10">Yours truly,</div>
                  <div className="block mt-6">{form.nameAndSignature}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


