"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AppealDoctorLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppealDoctorLetterModal({ isOpen, onClose }: AppealDoctorLetterModalProps) {
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
    if (d.length <= 6) return `${d.slice(0,4)}-${d.slice(4,6)}`;
    return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6)}`;
  };

  const update = (key: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [key]: key === "dob" ? maskDate(value) : value }));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open("", "_blank", "toolbar=no,location=no,menubar=no,width=900,height=1100");
    if (!win) return;
    const html = `<!DOCTYPE html><html><head><title>Appeal Process (Doctor)</title>
      <style>
        body{font-family: ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;color:#111827}
        .container{padding:32px}
        .title{font-size:22px;font-weight:700;text-align:center;margin-bottom:20px}
        .row{display:flex;justify-content:space-between;gap:20px;margin:6px 0}
        .col{flex:1}
        .label{font-weight:700}
        .sectionTitle{font-weight:700;text-align:center;margin:18px 0}
        .box{min-height:80px;border:1px solid #E5E7EB;border-radius:8px;padding:12px;margin-top:6px}
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Appeal Process Letter (Doctor)</h2>
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
                ["patient","Patient"],
                ["dob","Date of birth (yyyy-mm-dd)"],
                ["medicationName","Medication name"],
                ["prescribingDoctor","Prescribing doctor"],
                ["bandId","Band ID"],
                ["din","DIN"],
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

              {([
                ["condition","Condition"],
                ["diagnosis","Diagnosis & Prognosis (other drugs tried)"],
                ["tests","Test Results"],
                ["justification","Justification for the proposed drug & other information"],
              ] as Array<[keyof typeof form, string]>).map(([k,label]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <textarea
                    value={form[k]}
                    onChange={(e)=>update(k, e.target.value)}
                    rows={k === "justification" ? 5 : 3}
                    placeholder={label}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A438C] focus:border-transparent outline-none text-sm text-gray-900"
                  />
                </div>
              ))}
            </div>

            {/* Print preview */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <div ref={printRef}>
                <div className="title">Appeal Process</div>
                <div className="row">
                  <div className="col"><span className="label">Patient:</span> {form.patient}</div>
                  <div className="col"><span className="label">Prescribing doctor:</span> {form.prescribingDoctor}</div>
                </div>
                <div className="row">
                  <div className="col"><span className="label">Date of birth:</span> {form.dob}</div>
                  <div className="col"><span className="label">Band ID:</span> {form.bandId}</div>
                </div>
                <div className="row">
                  <div className="col"><span className="label">Medication name:</span> {form.medicationName}</div>
                  <div className="col"><span className="label">DIN:</span> {form.din}</div>
                </div>

                <div className="sectionTitle">Patient Diagnosis</div>

                <div className="block">
                  <div className="label">Condition:</div>
                  <div className="box">{form.condition}</div>
                </div>
                <div className="block">
                  <div className="label">Diagnosis & Prognosis (other drugs tried)</div>
                  <div className="box">{form.diagnosis}</div>
                </div>
                <div className="block">
                  <div className="label">Test Results:</div>
                  <div className="box">{form.tests}</div>
                </div>
                <div className="block">
                  <div className="label">Justification for the proposed drug & other information</div>
                  <div className="box">{form.justification}</div>
                </div>

                <div className="block" style={{ marginTop: 32 }}>
                  Doctor’s signature: _________________________________________________
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


