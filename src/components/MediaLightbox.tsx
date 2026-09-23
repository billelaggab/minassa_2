"use client";

import React, { useState } from "react";
import { X, Download, Fingerprint, FileText, Check, Copy } from "lucide-react";
import { AttachmentItem } from "./DossierDetail";

interface MediaLightboxProps {
  attachment: AttachmentItem | null;
  onClose: () => void;
}

export default function MediaLightbox({ attachment, onClose }: MediaLightboxProps) {
  const [copied, setCopied] = useState(false);

  if (!attachment) return null;

  const isImage = attachment.mimeType.startsWith("image/");
  const isPdf = attachment.mimeType.includes("pdf");

  const copyHash = () => {
    navigator.clipboard.writeText(attachment.sha256Hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!attachment.fileData) return;
    const a = document.createElement("a");
    a.href = attachment.fileData;
    a.download = attachment.originalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div
        className="w-full max-w-4xl bg-[#0b0f19] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-[#070a12] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-red-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 truncate max-w-md">
                {attachment.originalFilename}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                {attachment.mimeType} • {(attachment.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {attachment.fileData && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>تنزيل الملف</span>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SHA-256 Chain of custody banner */}
        <div className="bg-slate-950 p-2.5 px-4 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-red-400 font-mono text-[11px]">
            <span className="font-bold">سلسلة الحيازة الجنائية SHA-256:</span>
            <span className="text-slate-300 break-all select-all">{attachment.sha256Hash}</span>
          </div>
          <button
            onClick={copyHash}
            className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 shrink-0"
          >
            {copied ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> تم النسخ
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="w-3.5 h-3.5" /> نسخ البصمة
              </span>
            )}
          </button>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40 min-h-[350px]">
          {isImage && attachment.fileData ? (
            <img
              src={attachment.fileData}
              alt={attachment.originalFilename}
              className="max-h-[60vh] max-w-full object-contain rounded-lg border border-slate-800"
            />
          ) : isPdf && attachment.fileData ? (
            <iframe
              src={attachment.fileData}
              title={attachment.originalFilename}
              className="w-full h-[60vh] rounded-lg border border-slate-800 bg-white"
            />
          ) : (
            <div className="text-center p-8 text-slate-400">
              <FileText className="w-16 h-16 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-200">
                حرز رقمي محمي ومحفوظ بنجاح
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                تم التحقق من سلامة البصمة الجنائية (SHA-256) وسلسلة الحيازة المشفرة.
              </p>
              {attachment.contextDescription && (
                <p className="text-xs text-amber-300/80 mt-3 bg-slate-900 p-3 rounded-lg border border-slate-800 text-right">
                  {attachment.contextDescription}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
