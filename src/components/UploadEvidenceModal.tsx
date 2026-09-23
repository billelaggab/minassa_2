"use client";

import React, { useState } from "react";
import { X, UploadCloud, Fingerprint, FileCheck, AlertTriangle } from "lucide-react";

interface UploadEvidenceModalProps {
  personId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function UploadEvidenceModal({
  personId,
  isOpen,
  onClose,
  onSaved,
}: UploadEvidenceModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [sha256Hash, setSha256Hash] = useState<string>("");
  const [contextDescription, setContextDescription] = useState("");
  const [isSensitive, setIsSensitive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Calculate SHA-256 on the client
  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setError("");

    try {
      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setSha256Hash(hashHex);
    } catch (err) {
      console.error("SHA256 error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("يرجى اختيار ملف الحرز الرقمي");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contextDescription", contextDescription);
      formData.append("isSensitive", isSensitive ? "true" : "false");

      const res = await fetch(`/api/persons/${personId}/attachments`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "فشل إيداع الحرز الرقمي");
      } else {
        onSaved();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "خطأ أثناء رفع الملف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-[#0e1422] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-red-400" />
            <h3 className="text-base font-bold text-slate-100">
              إيداع حرز رقمي بسلسلة الحيازة (SHA-256)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & drop or file select */}
          <div className="border-2 border-dashed border-slate-700 hover:border-red-500/60 bg-slate-950/40 rounded-xl p-6 text-center cursor-pointer transition">
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="fileInput" className="cursor-pointer block">
              <UploadCloud className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-200">
                {file ? file.name : "اضغط لاختيار وثيقة، تقرير PDF، أو صورة حرز"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {file
                  ? `الحجم: ${(file.size / 1024).toFixed(1)} KB`
                  : "يتم فحص الملف وتوليد بصمة SHA-256 الجنائية فورياً بدون اتصال خارجي"}
              </p>
            </label>
          </div>

          {/* Generated SHA-256 fingerprint box */}
          {sha256Hash && (
            <div className="bg-slate-950 p-3 rounded-xl border border-red-950 text-xs">
              <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
                <FileCheck className="w-4 h-4" />
                <span>بصمة التشفير الجنائي المحسوبة (SHA-256):</span>
              </div>
              <p className="font-mono text-[10px] text-slate-300 break-all select-all">
                {sha256Hash}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              سياق ووصف الحرز الرقمي
            </label>
            <textarea
              rows={2}
              value={contextDescription}
              onChange={(e) => setContextDescription(e.target.value)}
              placeholder="مثال: لقطة شاشة للتحويل البنكي، صورة العقد الموثق، إفادة مسربة"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-red-500"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isSensitive}
              onChange={(e) => setIsSensitive(e.target.checked)}
              className="rounded text-red-600 focus:ring-0 bg-slate-800"
            />
            <span>حرز فائق السرية (يتم حجبه تلقائياً عند التصدير العام)</span>
          </label>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition disabled:opacity-50"
            >
              {loading ? "جاري الإيداع والتسجيل..." : "إيداع الحرز في النظام"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
